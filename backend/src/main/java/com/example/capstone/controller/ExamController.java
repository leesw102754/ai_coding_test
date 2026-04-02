package com.example.capstone.controller;

import com.example.capstone.entity.Exam;
import com.example.capstone.entity.Submission;
import com.example.capstone.repository.ExamRepository;
import com.example.capstone.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

//@Controller
@RequiredArgsConstructor // 의존성 주입(Repository 연결)을 자동으로 해줌
public class ExamController {

    private final ExamRepository examRepository;

    // 1. 관리자 페이지: 문제 등록 화면 보여주기
    @GetMapping("/admin")
    public String adminPage() {
        return "admin"; // admin.html 파일을 찾아감
    }

    // 관리자가 작성한 문제를 DB에 저장하는 주소
    @PostMapping("/admin/save")
    public String saveExam(@RequestParam String title, @RequestParam String description) {
        Exam newExam = new Exam();
        newExam.setTitle(title);
        newExam.setDescription(description);

        examRepository.save(newExam); // DB에 문제 저장
        return "redirect:/exams"; // 저장 후 시험 목록 페이지로 이동
    }

    // 3. 학생/목록 페이지: 저장된 모든 문제 보여주기
    @GetMapping("/exams")
    public String listPage(Model model) {
        List<Exam> exams = examRepository.findAll(); // DB에서 모든 문제 가져오기
        model.addAttribute("exams", exams); // 화면(HTML)으로 데이터 전달
        return "list"; // list.html 파일을 찾아감
    }

    // ... 기존 코드 아래에 추가 ...
    private final SubmissionRepository submissionRepository; // 생성자 주입 확인!

    // 1. 문제 풀기 페이지 보여주기
    @GetMapping("/exams/{id}/solve")
    public String solvePage(@PathVariable Long id, Model model) {
        Exam exam = examRepository.findById(id).orElseThrow();
        model.addAttribute("exam", exam);
        return "solve"; // solve.html로 이동
    }

    // 2. 답안 제출 처리
    @PostMapping("/exams/submit")
    public String submitCode(@RequestParam Long examId,
                             @RequestParam String studentName,
                             @RequestParam String code) {
        Submission sub = new Submission();
        sub.setExamId(examId);
        sub.setStudentName(studentName);
        sub.setCode(code);
        sub.setSubmitTime(LocalDateTime.now());

        submissionRepository.save(sub); // DB에 학생 답안 저장
        return "redirect:/exams/success"; // 제출 완료 페이지로 이동
    }

    @GetMapping("/exams/success")
    public String success() {
        return "success";
    }
}