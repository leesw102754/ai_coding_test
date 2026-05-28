package com.example.capstone.controller;

import com.example.capstone.dto.LoginResponse;
import com.example.capstone.dto.UserRequest;
import com.example.capstone.entity.User;
import com.example.capstone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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

    // 학번(StudentId) 중복 확인 API
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
        user.setName(request.getName());
        user.setStudentId(request.getStudentId());
        user.setRole("USER");

        userRepository.save(user);

        return "회원가입 완료";
    }

    // 로그인 API
    @PostMapping("/login")
    public LoginResponse login(@RequestBody UserRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("아이디가 없습니다."));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("비밀번호가 틀렸습니다.");
        }

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getName(),
                user.getStudentId(),
                user.getRole()
        );
    }

    // 관리자용 전체 사용자 목록 조회
    @GetMapping("/admin/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 관리자용 사용자 정보 수정
    @PatchMapping("/admin/users/{id}")
    public Map<String, Object> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));

        String username = getStringValue(request, "username");
        String name = getStringValue(request, "name");
        String studentId = getStringValue(request, "studentId");
        String password = getStringValue(request, "password");

        if (username != null && !username.isBlank()) {
            User duplicatedUser = userRepository.findByUsername(username.trim()).orElse(null);

            if (duplicatedUser != null && !duplicatedUser.getId().equals(user.getId())) {
                throw new RuntimeException("이미 사용 중인 아이디입니다.");
            }

            user.setUsername(username.trim());
        }

        if (name != null) {
            if (name.isBlank()) {
                throw new RuntimeException("이름은 비워둘 수 없습니다.");
            }

            user.setName(name.trim());
        }

        if (studentId != null && !studentId.isBlank()) {
            User duplicatedStudent = userRepository.findByStudentId(studentId.trim()).orElse(null);

            if (duplicatedStudent != null && !duplicatedStudent.getId().equals(user.getId())) {
                throw new RuntimeException("이미 등록된 학번입니다.");
            }

            user.setStudentId(studentId.trim());
        }

        if (password != null && !password.isBlank()) {
            user.setPassword(password.trim());
        }

        User saved = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "사용자 정보가 수정되었습니다.");
        response.put("user", saved);

        return response;
    }

    // 관리자용 특정 사용자 삭제
    @DeleteMapping("/admin/users/{id}")
    public Map<String, Object> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 회원입니다."));

        if (isAdminUser(user)) {
            throw new RuntimeException("관리자 계정은 삭제할 수 없습니다.");
        }

        userRepository.delete(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("deletedId", id);
        response.put("deletedUsername", user.getUsername());
        response.put("message", user.getName() + "(" + user.getUsername() + ") 계정이 삭제되었습니다.");

        return response;
    }

    // 관리자용 선택 사용자 일괄 삭제
    @DeleteMapping("/admin/users/bulk")
    public Map<String, Object> deleteUsersBulk(@RequestBody Map<String, List<Long>> request) {
        List<Long> ids = request.get("ids");

        if (ids == null || ids.isEmpty()) {
            throw new RuntimeException("삭제할 사용자를 선택하세요.");
        }

        List<User> users = userRepository.findAllById(ids);

        long adminCount = users.stream()
                .filter(this::isAdminUser)
                .count();

        if (adminCount > 0) {
            throw new RuntimeException("관리자 계정은 일괄 삭제할 수 없습니다.");
        }

        userRepository.deleteAll(users);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("deletedCount", users.size());
        response.put("message", users.size() + "개 계정이 삭제되었습니다.");

        return response;
    }

    private boolean isAdminUser(User user) {
        return "ADMIN".equalsIgnoreCase(user.getRole())
                || "admin".equalsIgnoreCase(user.getUsername());
    }

    private String getStringValue(Map<String, Object> request, String key) {
        Object value = request.get(key);

        if (value == null) {
            return null;
        }

        return String.valueOf(value);
    }
}
