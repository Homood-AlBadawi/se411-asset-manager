package edu.psu.se411.assets.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record Asset(
		@Id Long id,
		@NotBlank(message = "Asset name cannot be empty")
		@Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters")
		String name,
		@NotBlank(message = "Asset tag cannot be empty")
		@Pattern(regexp = "^[A-Za-z0-9-]{3,20}$", message = "Tag may only contain letters, numbers and dashes")
		String tag,
		@NotBlank(message = "Category cannot be empty")
		String category,
		@NotBlank(message = "Status cannot be empty")
		String status,
		String department,
		String assignedTo,
		String location,
		@PastOrPresent(message = "Purchase date cannot be in the future")
		LocalDate purchaseDate,
		@PositiveOrZero(message = "Purchase cost cannot be negative")
		BigDecimal purchaseCost,
		@Size(max = 500, message = "Notes cannot be longer than 500 characters")
		String notes
		) {}
