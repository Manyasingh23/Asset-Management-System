package com.example.demo.service;

import com.example.demo.entity.Asset;
import com.example.demo.repository.AssetRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    private final AssetRepository assetRepository;

    public AssetService(AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    // Get all assets
    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    // Get asset by ID
    public Asset getAssetById(Long id) {
        return assetRepository.findById(id).orElse(null);
    }

    // Add new asset
    public Asset addAsset(Asset asset) {
        return assetRepository.save(asset);
    }

    // Update asset
    public Asset updateAsset(Long id, Asset asset) {

        Asset existingAsset = assetRepository.findById(id).orElse(null);

        if (existingAsset != null) {
            existingAsset.setName(asset.getName());
            existingAsset.setType(asset.getType());
            existingAsset.setStatus(asset.getStatus());
            existingAsset.setEmployeeId(asset.getEmployeeId());

            return assetRepository.save(existingAsset);
        }

        return null;
    }

    // Delete asset
    public void deleteAsset(Long id) {
        assetRepository.deleteById(id);
    }
}