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
public class PythonJudgeService {

    public JudgeResult judge(String code, List<TestCase> testCases) {
        JudgeResult result = new JudgeResult();
        result.setCompileOutput("");
        result.setExecutionTimeMs(0);
        result.setMemoryKb(0);

        List<FailedCase> failedCases = new ArrayList<>();

        try {
            Path tempFile = Files.createTempFile("submission_", ".py");
            Files.writeString(tempFile, code, StandardCharsets.UTF_8);

            for (TestCase tc : testCases) {
                ProcessBuilder pb = new ProcessBuilder("python", tempFile.toString());
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
                    if (lowerErr.contains("indexerror")) {
                        result.setErrorTypeHint("index_error");
                        failedCase.setReason("리스트 인덱스 범위를 벗어남");
                    } else if (lowerErr.contains("typeerror")) {
                        result.setErrorTypeHint("type_error");
                        failedCase.setReason("타입 불일치");
                    } else if (lowerErr.contains("syntaxerror")) {
                        result.setStatus("syntax_error");
                        result.setErrorTypeHint("syntax_error");
                        failedCase.setReason("문법 오류");
                    } else {
                        result.setErrorTypeHint("runtime_error");
                        failedCase.setReason("실행 중 오류 발생");
                    }

                    failedCases.add(failedCase);
                    result.setFailedCases(failedCases);

                    Files.deleteIfExists(tempFile);
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

                    Files.deleteIfExists(tempFile);
                    return result;
                }
            }

            Files.deleteIfExists(tempFile);

            result.setStatus("accepted");
            result.setErrorTypeHint(null);
            result.setFailedCases(List.of());
            return result;

        } catch (Exception e) {
            FailedCase failedCase = new FailedCase();
            failedCase.setInput("");
            failedCase.setExpectedOutput("");
            failedCase.setActualOutput("");
            failedCase.setReason("Python 실행 자체 실패");

            result.setStatus("runtime_error");
            result.setErrorTypeHint("runtime_error");
            result.setStdout("");
            result.setStderr(e.getMessage());
            result.setFailedCases(List.of(failedCase));
            return result;
        }
    }

    private String normalize(String text) {
        return text == null ? "" : text.strip().replace("\r\n", "\n");
    }
}