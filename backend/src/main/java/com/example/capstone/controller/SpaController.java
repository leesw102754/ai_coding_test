package com.example.capstone.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
            "/{path:[^\\.]*}",           // /results 같은 1단계 주소
            "/**/{path:[^\\.]*}"         // /exams/1 같은 2단계 이상 주소
    })
    public String forward() {
        return "forward:/index.html"; // 👈 "에러 내지 말고 정문(리액트)으로 가!"라는 뜻
    }
}