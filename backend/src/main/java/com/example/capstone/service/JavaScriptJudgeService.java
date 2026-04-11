package com.example.capstone.service;

import com.example.capstone.dto.FailedCase;
import com.example.capstone.dto.JudgeResult;
import com.example.capstone.entity.TestCase;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class JavaScriptJudgeService {

    public JudgeResult judge(String code, List<TestCase> testCases) {
        JudgeResult result = new JudgeResult();
        result.setCompileOutput("");
        result.setExecutionTimeMs(0);
        result.setMemoryKb(0);

        List<FailedCase> failedCases = new ArrayList<>();
        Path tempFile = null;

        try {
            tempFile = Files.createTempFile("submission_", ".js");
            Files.writeString(tempFile, code, StandardCharsets.UTF_8);

            for (TestCase tc : testCases) {
                ProcessBuilder pb = new ProcessBuilder("node", tempFile.toString());
                Process process = pb.start();

                try (OutputStream os = process.getOutputStream()) {
                    os.write((tc.getInput() == null ? "" : tc.getInput()).getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }

                String stdout = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                String stderr = new String(process.getErrorStream().readAllBytes(), StandardCharsets.UTF_8);

                int exitCode = process.waitFor();

                result.setStdout(stdout);
                result.setStderr(stderr);

                FailedCase failedCase = new FailedCase();
                failedCase.setInput(tc.getInput());
                failedCase.setExpectedOutput(tc.getExpectedOutput());
                failedCase.setActualOutput(normalize(stdout));

                if (exitCode != 0) {
                    result.setStatus("runtime_error");

                    String lowerErr = stderr.toLowerCase();
                    if (lowerErr.contains("syntaxerror")) {
                        result.setStatus("syntax_error");
                        result.setErrorTypeHint("syntax_error");
                        failedCase.setReason("문법 오류");
                    } else if (lowerErr.contains("referenceerror")) {
                        result.setErrorTypeHint("runtime_error");
                        failedCase.setReason("정의되지 않은 변수를 사용함");
                    } else if (lowerErr.contains("typeerror")) {
                        result.setErrorTypeHint("type_error");
                        failedCase.setReason("타입 또는 값 사용 방식이 잘못됨");
                    } else if (lowerErr.contains("rangeerror")) {
                        result.setErrorTypeHint("runtime_error");
                        failedCase.setReason("허용 범위를 벗어난 값 사용");
                    } else {
                        result.setErrorTypeHint("runtime_error");
                        failedCase.setReason("실행 중 오류 발생");
                    }

                    failedCases.add(failedCase);
                    result.setFailedCases(failedCases);
                    return result;
                }

                String actual = normalize(stdout);
                String expected = normalize(tc.getExpectedOutput());

                if (!actual.equals(expected)) {
                    result.setStatus("wrong_answer");
                    result.setErrorTypeHint("logic_error");
                    failedCase.setReason("출력이 정답과 다름");

                    failedCases.add(failedCase);
                    result.setFailedCases(failedCases);
                    return result;
                }
            }

            result.setStatus("accepted");
            result.setErrorTypeHint(null);
            result.setFailedCases(List.of());
            return result;

        } catch (Exception e) {
            FailedCase failedCase = new FailedCase();
            failedCase.setInput("");
            failedCase.setExpectedOutput("");
            failedCase.setActualOutput("");
            failedCase.setReason("JavaScript 실행 자체 실패");

            result.setStatus("runtime_error");
            result.setErrorTypeHint("runtime_error");
            result.setStdout("");
            result.setStderr(e.getMessage());
            result.setFailedCases(List.of(failedCase));
            return result;
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (Exception ignored) {
                }
            }
        }
    }

    private String normalize(String text) {
        return text == null ? "" : text.strip().replace("\r\n", "\n");
    }
}