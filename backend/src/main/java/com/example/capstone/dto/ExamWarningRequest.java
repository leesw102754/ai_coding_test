package com.example.capstone.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "학생 이탈 알림 요청 객체")
public class ExamWarningRequest {
    @Schema(description = "학생 학번", example = "2024001")
    private String studentId;

    @Schema(description = "학생 이름", example = "홍길동")
    private String studentName;
}
