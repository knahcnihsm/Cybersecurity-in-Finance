package com.cybergate.asset.service;

import com.cybergate.asset.model.Asset;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CriticalityService {

    private static final BigDecimal INTERNET_EXPOSURE_MULTIPLIER = new BigDecimal("2.0");
    private static final BigDecimal HIGH_SENSITIVITY_MULTIPLIER = new BigDecimal("1.5");
    private static final BigDecimal MEDIUM_SENSITIVITY_MULTIPLIER = new BigDecimal("1.2");
    private static final BigDecimal HIGH_VALUE_THRESHOLD = new BigDecimal("1000000");
    private static final BigDecimal MEDIUM_VALUE_THRESHOLD = new BigDecimal("100000");
    private static final int MIN_SCORE = 1;
    private static final int MAX_SCORE = 10;

    public int calculateCriticality(Asset asset) {
        BigDecimal score = BigDecimal.ZERO;

        if (asset.getBusinessValueInr() != null) {
            if (asset.getBusinessValueInr().compareTo(HIGH_VALUE_THRESHOLD) >= 0) {
                score = score.add(new BigDecimal("4"));
            } else if (asset.getBusinessValueInr().compareTo(MEDIUM_VALUE_THRESHOLD) >= 0) {
                score = score.add(new BigDecimal("2"));
            } else {
                score = score.add(new BigDecimal("1"));
            }
        }

        if (asset.getAnnualRevenueImpact() != null) {
            if (asset.getAnnualRevenueImpact().compareTo(HIGH_VALUE_THRESHOLD) >= 0) {
                score = score.add(new BigDecimal("3"));
            } else if (asset.getAnnualRevenueImpact().compareTo(MEDIUM_VALUE_THRESHOLD) >= 0) {
                score = score.add(new BigDecimal("1.5"));
            } else {
                score = score.add(new BigDecimal("0.5"));
            }
        }

        if (Boolean.TRUE.equals(asset.getInternetExposed())) {
            score = score.multiply(INTERNET_EXPOSURE_MULTIPLIER);
        }

        if (asset.getDataSensitivity() != null) {
            String sensitivity = asset.getDataSensitivity().toUpperCase();
            switch (sensitivity) {
                case "CRITICAL", "HIGH" -> score = score.multiply(HIGH_SENSITIVITY_MULTIPLIER);
                case "MEDIUM" -> score = score.multiply(MEDIUM_SENSITIVITY_MULTIPLIER);
                default -> {}
            }
        }

        int finalScore = score.setScale(0, RoundingMode.HALF_UP).intValue();
        return Math.max(MIN_SCORE, Math.min(MAX_SCORE, finalScore));
    }
}
