package edu.psu.se411.assets.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import edu.psu.se411.assets.model.Asset;

@Repository
public interface AssetRepository extends CrudRepository<Asset, Long>, PagingAndSortingRepository<Asset, Long> {
}
