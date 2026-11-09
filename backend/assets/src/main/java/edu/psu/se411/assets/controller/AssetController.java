package edu.psu.se411.assets.controller;

import java.net.URI;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.relational.core.conversion.DbActionExecutionException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import edu.psu.se411.assets.exception.ObjectNotFoundException;
import edu.psu.se411.assets.model.Asset;
import edu.psu.se411.assets.service.AssetService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/v1/assets")
public class AssetController {

	private AssetService assetService;

	public AssetController(AssetService assetService) {
		this.assetService = assetService;
	}

	@GetMapping()
	public ResponseEntity<Page<Asset>> findAll(Pageable pageable) {
		return ResponseEntity.ok(assetService.getAllAssets(pageable));
	}

	@GetMapping("/{id}")
	public ResponseEntity<Asset> findById(@PathVariable @Positive Long id) {
		Optional<Asset> optionalAsset = assetService.getAssetById(id);
		if (optionalAsset.isPresent()) {
			return ResponseEntity.ok(optionalAsset.get());
		}
		return ResponseEntity.notFound().build();
	}

	@PostMapping()
	public ResponseEntity<Void> create(@Valid @RequestBody Asset asset, UriComponentsBuilder ucb) {
		if (asset.id() != null) {
			return ResponseEntity.badRequest().build();
		}
		try {
			Asset createdAsset = assetService.createAsset(asset);
			URI uri = ucb.path("/api/v1/assets/{id}").buildAndExpand(createdAsset.id()).toUri();
			return ResponseEntity.created(uri).build();
		} catch (DbActionExecutionException | DataIntegrityViolationException e) {
			return ResponseEntity.status(HttpStatus.CONFLICT).build();
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<Void> update(@PathVariable @Positive Long id, @Valid @RequestBody Asset asset) {
		try {
			assetService.updateAsset(id, asset);
			return ResponseEntity.noContent().build();
		} catch (ObjectNotFoundException e) {
			return ResponseEntity.notFound().build();
		} catch (DbActionExecutionException | DataIntegrityViolationException e) {
			return ResponseEntity.status(HttpStatus.CONFLICT).build();
		}
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable @Positive Long id) {
		try {
			assetService.deleteAsset(id);
			return ResponseEntity.noContent().build();
		} catch (ObjectNotFoundException e) {
			return ResponseEntity.notFound().build();
		}
	}
}
