package com.example.capstone.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String username;
    private String name;
    private String studentId;
    private String role;
}
