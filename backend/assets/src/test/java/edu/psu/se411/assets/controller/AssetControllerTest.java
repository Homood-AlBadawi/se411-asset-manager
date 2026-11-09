package edu.psu.se411.assets.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.ObjectMapper;

import edu.psu.se411.assets.exception.ObjectNotFoundException;
import edu.psu.se411.assets.model.Asset;
import edu.psu.se411.assets.service.AssetService;

@WebMvcTest(AssetController.class)
class AssetControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockitoBean
	private AssetService assetService;

	private Asset laptop;
	private Asset draft;

	@BeforeEach
	void setUp() {
		laptop = new Asset(1L, "MacBook Pro 14\" M3", "PSU-LT-0431", "Laptop", "In Use", "Engineering",
				"Homood AlBadawi", "Building 101 - Lab 3", LocalDate.of(2025, 2, 11),
				new BigDecimal("8499.00"), "Primary development machine.");
		draft = new Asset(null, "New Printer", "PSU-PR-9001", "Printer", "In Storage", "Operations",
				"", "Store", LocalDate.of(2026, 3, 10), new BigDecimal("1450.00"), "");
	}

	@Test
	@DisplayName("GET /api/v1/assets returns 200 and a page of assets")
	void findAllReturnsPage() throws Exception {
		when(assetService.getAllAssets(any())).thenReturn(new PageImpl<>(List.of(laptop), PageRequest.of(0, 10), 1));

		mockMvc.perform(get("/api/v1/assets"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()").value(1))
				.andExpect(jsonPath("$.content[0].tag").value("PSU-LT-0431"))
				.andExpect(jsonPath("$.totalElements").value(1));
	}

	@Test
	@DisplayName("GET /api/v1/assets/{id} returns 200 and the asset when it exists")
	void findByIdFound() throws Exception {
		when(assetService.getAssetById(1L)).thenReturn(Optional.of(laptop));

		mockMvc.perform(get("/api/v1/assets/1"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.id").value(1))
				.andExpect(jsonPath("$.name").value("MacBook Pro 14\" M3"));
	}

	@Test
	@DisplayName("GET /api/v1/assets/{id} returns 404 when the id is unknown")
	void findByIdNotFound() throws Exception {
		when(assetService.getAssetById(99L)).thenReturn(Optional.empty());

		mockMvc.perform(get("/api/v1/assets/99"))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST /api/v1/assets returns 201 and a Location header")
	void createReturnsCreated() throws Exception {
		Asset saved = new Asset(11L, draft.name(), draft.tag(), draft.category(), draft.status(),
				draft.department(), draft.assignedTo(), draft.location(), draft.purchaseDate(),
				draft.purchaseCost(), draft.notes());
		when(assetService.createAsset(any(Asset.class))).thenReturn(saved);

		mockMvc.perform(post("/api/v1/assets")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(draft)))
				.andExpect(status().isCreated())
				.andExpect(header().string("Location", "http://localhost/api/v1/assets/11"));
	}

	@Test
	@DisplayName("POST /api/v1/assets returns 400 when the body carries an id")
	void createRejectsSuppliedId() throws Exception {
		mockMvc.perform(post("/api/v1/assets")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(laptop)))
				.andExpect(status().isBadRequest());

		verify(assetService, never()).createAsset(any(Asset.class));
	}

	@Test
	@DisplayName("POST /api/v1/assets returns 400 when the name is blank")
	void createRejectsBlankName() throws Exception {
		Asset invalid = new Asset(null, "  ", draft.tag(), draft.category(), draft.status(), draft.department(),
				draft.assignedTo(), draft.location(), draft.purchaseDate(), draft.purchaseCost(), draft.notes());

		mockMvc.perform(post("/api/v1/assets")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(invalid)))
				.andExpect(status().isBadRequest());

		verify(assetService, never()).createAsset(any(Asset.class));
	}

	@Test
	@DisplayName("POST /api/v1/assets returns 400 when the tag breaks the pattern")
	void createRejectsIllegalTag() throws Exception {
		Asset invalid = new Asset(null, draft.name(), "bad tag!", draft.category(), draft.status(),
				draft.department(), draft.assignedTo(), draft.location(), draft.purchaseDate(),
				draft.purchaseCost(), draft.notes());

		mockMvc.perform(post("/api/v1/assets")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(invalid)))
				.andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST /api/v1/assets returns 400 when the cost is negative")
	void createRejectsNegativeCost() throws Exception {
		Asset invalid = new Asset(null, draft.name(), draft.tag(), draft.category(), draft.status(),
				draft.department(), draft.assignedTo(), draft.location(), draft.purchaseDate(),
				new BigDecimal("-5.00"), draft.notes());

		mockMvc.perform(post("/api/v1/assets")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(invalid)))
				.andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("PUT /api/v1/assets/{id} returns 204 on a successful update")
	void updateReturnsNoContent() throws Exception {
		when(assetService.updateAsset(eq(1L), any(Asset.class))).thenReturn(laptop);

		mockMvc.perform(put("/api/v1/assets/1")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(draft)))
				.andExpect(status().isNoContent());
	}

	@Test
	@DisplayName("PUT /api/v1/assets/{id} returns 404 when the id is unknown")
	void updateNotFound() throws Exception {
		when(assetService.updateAsset(eq(99L), any(Asset.class)))
				.thenThrow(new ObjectNotFoundException("Asset not found"));

		mockMvc.perform(put("/api/v1/assets/99")
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(draft)))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("DELETE /api/v1/assets/{id} returns 204 on success")
	void deleteReturnsNoContent() throws Exception {
		mockMvc.perform(delete("/api/v1/assets/1"))
				.andExpect(status().isNoContent());

		verify(assetService).deleteAsset(1L);
	}

	@Test
	@DisplayName("DELETE /api/v1/assets/{id} returns 404 when the id is unknown")
	void deleteNotFound() throws Exception {
		doThrow(new ObjectNotFoundException("Asset not found")).when(assetService).deleteAsset(99L);

		mockMvc.perform(delete("/api/v1/assets/99"))
				.andExpect(status().isNotFound());
	}
}
