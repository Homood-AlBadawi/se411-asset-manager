package edu.psu.se411.assets.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import edu.psu.se411.assets.exception.ObjectNotFoundException;
import edu.psu.se411.assets.model.Asset;
import edu.psu.se411.assets.repository.AssetRepository;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

	@Mock
	private AssetRepository assetRepository;

	@InjectMocks
	private AssetService assetService;

	private Asset laptop;
	private Asset monitor;

	@BeforeEach
	void setUp() {
		laptop = new Asset(1L, "MacBook Pro 14\" M3", "PSU-LT-0431", "Laptop", "In Use", "Engineering",
				"Homood AlBadawi", "Building 101 - Lab 3", LocalDate.of(2025, 2, 11),
				new BigDecimal("8499.00"), "Primary development machine.");
		monitor = new Asset(2L, "Dell UltraSharp U2723QE", "PSU-MN-0788", "Monitor", "In Storage", "Unassigned",
				"", "Central Store - Shelf B4", LocalDate.of(2025, 5, 20),
				new BigDecimal("2100.00"), "Spare display.");
	}

	@Test
	@DisplayName("getAllAssets returns the page the repository produced")
	void getAllAssetsReturnsPage() {
		Pageable pageable = PageRequest.of(0, 10);
		Page<Asset> page = new PageImpl<>(List.of(laptop, monitor), pageable, 2);
		when(assetRepository.findAll(pageable)).thenReturn(page);

		Page<Asset> result = assetService.getAllAssets(pageable);

		assertThat(result.getContent()).containsExactly(laptop, monitor);
		assertThat(result.getTotalElements()).isEqualTo(2);
		verify(assetRepository, times(1)).findAll(pageable);
	}

	@Test
	@DisplayName("getAllAssets passes the requested page size through to the repository")
	void getAllAssetsHonoursPageSize() {
		Pageable pageable = PageRequest.of(1, 3);
		when(assetRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(monitor), pageable, 10));

		Page<Asset> result = assetService.getAllAssets(pageable);

		assertThat(result.getNumber()).isEqualTo(1);
		assertThat(result.getSize()).isEqualTo(3);
		assertThat(result.getTotalPages()).isEqualTo(4);
	}

	@Test
	@DisplayName("getAssetById returns the asset when it exists")
	void getAssetByIdFound() {
		when(assetRepository.findById(1L)).thenReturn(Optional.of(laptop));

		Optional<Asset> result = assetService.getAssetById(1L);

		assertThat(result).contains(laptop);
	}

	@Test
	@DisplayName("getAssetById returns empty when the id is unknown")
	void getAssetByIdNotFound() {
		when(assetRepository.findById(99L)).thenReturn(Optional.empty());

		assertThat(assetService.getAssetById(99L)).isEmpty();
	}

	@Test
	@DisplayName("createAsset delegates to repository.save and returns the saved asset")
	void createAssetSaves() {
		Asset draft = new Asset(null, "New Printer", "PSU-PR-9001", "Printer", "In Storage", "Operations",
				"", "Store", LocalDate.of(2026, 3, 10), new BigDecimal("1450.00"), "");
		Asset saved = new Asset(11L, draft.name(), draft.tag(), draft.category(), draft.status(),
				draft.department(), draft.assignedTo(), draft.location(), draft.purchaseDate(),
				draft.purchaseCost(), draft.notes());
		when(assetRepository.save(draft)).thenReturn(saved);

		Asset result = assetService.createAsset(draft);

		assertThat(result.id()).isEqualTo(11L);
		verify(assetRepository).save(draft);
	}

	@Test
	@DisplayName("updateAsset keeps the path id and saves the incoming values")
	void updateAssetKeepsPathId() {
		Asset changes = new Asset(null, "MacBook Pro 16\" M4", "PSU-LT-0431", "Laptop", "Under Maintenance",
				"Engineering", "Malik Tariq", "Building 101 - Lab 3", LocalDate.of(2025, 2, 11),
				new BigDecimal("8499.00"), "Battery service.");
		when(assetRepository.findById(1L)).thenReturn(Optional.of(laptop));
		when(assetRepository.save(any(Asset.class))).thenAnswer(call -> call.getArgument(0));

		assetService.updateAsset(1L, changes);

		ArgumentCaptor<Asset> captor = ArgumentCaptor.forClass(Asset.class);
		verify(assetRepository).save(captor.capture());
		Asset saved = captor.getValue();
		assertThat(saved.id()).isEqualTo(1L);
		assertThat(saved.name()).isEqualTo("MacBook Pro 16\" M4");
		assertThat(saved.status()).isEqualTo("Under Maintenance");
		assertThat(saved.assignedTo()).isEqualTo("Malik Tariq");
	}

	@Test
	@DisplayName("updateAsset throws ObjectNotFoundException for an unknown id and saves nothing")
	void updateAssetNotFound() {
		when(assetRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> assetService.updateAsset(99L, laptop))
				.isInstanceOf(ObjectNotFoundException.class)
				.hasMessage("Asset not found");

		verify(assetRepository, never()).save(any(Asset.class));
	}

	@Test
	@DisplayName("deleteAsset removes the asset when it exists")
	void deleteAssetFound() {
		when(assetRepository.findById(1L)).thenReturn(Optional.of(laptop));

		assetService.deleteAsset(1L);

		verify(assetRepository).deleteById(1L);
	}

	@Test
	@DisplayName("deleteAsset throws ObjectNotFoundException for an unknown id and deletes nothing")
	void deleteAssetNotFound() {
		when(assetRepository.findById(99L)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> assetService.deleteAsset(99L))
				.isInstanceOf(ObjectNotFoundException.class);

		verify(assetRepository, never()).deleteById(any());
	}
}
