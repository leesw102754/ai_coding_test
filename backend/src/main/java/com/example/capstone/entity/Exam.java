package com.example.capstone.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;       // 시험 제목

    @Column(columnDefinition = "TEXT")
    private String description; // 시험 문제 내용 (길 수도 있으니 TEXT 타입으로)

    private String difficulty;

    private String source; // manual or ai

    private Integer point;
}
