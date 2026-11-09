package edu.psu.se411.assets.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import edu.psu.se411.assets.exception.ObjectNotFoundException;
import edu.psu.se411.assets.model.Asset;
import edu.psu.se411.assets.repository.AssetRepository;

@Service
public class AssetService {

	private AssetRepository assetRepository;

	public AssetService(AssetRepository assetRepository) {
		this.assetRepository = assetRepository;
	}

	public Page<Asset> getAllAssets(Pageable pageable) {
		return assetRepository.findAll(pageable);
	}

	public Optional<Asset> getAssetById(Long id) {
		return assetRepository.findById(id);
	}

	public Asset createAsset(Asset asset) {
		return assetRepository.save(asset);
	}

	public Asset updateAsset(Long id, Asset asset) {
		Asset existingAsset = assetRepository.findById(id)
				.orElseThrow(() -> new ObjectNotFoundException("Asset not found"));
		System.out.println("Updating asset: " + existingAsset.toString());
		Asset updatedAsset = new Asset(id, asset.name(), asset.tag(), asset.category(), asset.status(),
				asset.department(), asset.assignedTo(), asset.location(), asset.purchaseDate(),
				asset.purchaseCost(), asset.notes());
		return assetRepository.save(updatedAsset);
	}

	public void deleteAsset(Long id) {
		Asset existingAsset = assetRepository.findById(id)
				.orElseThrow(() -> new ObjectNotFoundException("Asset not found"));
		assetRepository.deleteById(existingAsset.id());
	}
}
