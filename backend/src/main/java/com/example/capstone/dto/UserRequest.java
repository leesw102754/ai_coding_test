package com.example.capstone.dto;

import lombok.Data;

@Data
public class UserRequest {
    private String username;
    private String password;
    private String name;
    private String studentId;
}
