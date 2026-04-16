package com.example.capstone.controller;

import com.example.capstone.dto.LoginResponse;
import com.example.capstone.dto.UserRequest;
import com.example.capstone.entity.User;
import com.example.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserApiController {

    private final UserRepository userRepository;

    // 아이디(Username) 중복 확인 API
    @GetMapping("/check-username/{username}")
    public Map<String, Object> checkUsername(@PathVariable String username) {
        boolean exists = userRepository.existsByUsername(username);
        Map<String, Object> response = new HashMap<>();
        response.put("available", !exists);
        response.put("message", exists ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다.");
        return response;
    }

    //학번(StudentId) 중복 확인 API
    @GetMapping("/check-studentid/{studentId}")
    public Map<String, Object> checkStudentId(@PathVariable String studentId) {
        boolean exists = userRepository.existsByStudentId(studentId);
        Map<String, Object> response = new HashMap<>();
        response.put("available", !exists);
        response.put("message", exists ? "이미 등록된 학번입니다." : "사용 가능한 학번입니다.");
        return response;
    }

    // 회원가입 API
    @PostMapping("/signup")
    public String signup(@RequestBody UserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("이미 존재하는 아이디입니다.");
        }

        if (userRepository.existsByStudentId(request.getStudentId())) {
            throw new RuntimeException("이미 등록된 학번입니다.");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword());
        user.setName(request.getName());           // 이름 저장
        user.setStudentId(request.getStudentId()); // 학번 저장
        user.setRole("USER");

        userRepository.save(user);
        return "회원가입 완료";
    }

    //로그인 API
    @PostMapping("/login")
    public LoginResponse login(@RequestBody UserRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("아이디가 없습니다."));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("비밀번호가 틀렸습니다.");
        }

        // 로그인 성공 시 이름과 학번까지 다 담아서 보냄
        return new LoginResponse(user.getId(), user.getUsername(), user.getName(), user.getStudentId(), user.getRole());
    }
}
