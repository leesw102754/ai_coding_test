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
public class JavaJudgeService {

    public JudgeResult judge(String code, List<TestCase> testCases) {
        JudgeResult result = new JudgeResult();
        result.setCompileOutput("");
        result.setExecutionTimeMs(0);
        result.setMemoryKb(0);

        List<FailedCase> failedCases = new ArrayList<>();
        Path tempDir = null;

        try {
            tempDir = Files.createTempDirectory("java_submission_");
            Path sourceFile = tempDir.resolve("Main.java");

            Files.writeString(sourceFile, code, StandardCharsets.UTF_8);

            ProcessBuilder compilePb = new ProcessBuilder(
                    "javac",
                    sourceFile.toString()
            );
            compilePb.directory(tempDir.toFile());

            Process compileProcess = compilePb.start();

            String compileStdout = new String(
                    compileProcess.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );
            String compileStderr = new String(
                    compileProcess.getErrorStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            int compileExitCode = compileProcess.waitFor();

            result.setCompileOutput(compileStdout + compileStderr);

            if (compileExitCode != 0) {
                result.setStatus("compile_error");
                result.setErrorTypeHint("compile_error");
                result.setStdout("");
                result.setStderr(compileStderr);

                FailedCase failedCase = new FailedCase();
                failedCase.setInput("");
                failedCase.setExpectedOutput("");
                failedCase.setActualOutput("");
                failedCase.setReason("Java 컴파일 오류");

                failedCases.add(failedCase);
                result.setFailedCases(failedCases);

                cleanup(tempDir);
                return result;
            }

            for (TestCase tc : testCases) {
                ProcessBuilder runPb = new ProcessBuilder(
                        "java",
                        "-cp",
                        tempDir.toString(),
                        "Main"
                );
                runPb.directory(tempDir.toFile());

                Process process = runPb.start();

                try (OutputStream os = process.getOutputStream()) {
                    os.write((tc.getInput() == null ? "" : tc.getInput()).getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }

                String stdout = new String(
                        process.getInputStream().readAllBytes(),
                        StandardCharsets.UTF_8
                );
                String stderr = new String(
                        process.getErrorStream().readAllBytes(),
                        StandardCharsets.UTF_8
                );

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

                    if (lowerErr.contains("arrayindexoutofboundsexception")
                            || lowerErr.contains("stringindexoutofboundsexception")
                            || lowerErr.contains("indexoutofboundsexception")) {
                        result.setErrorTypeHint("index_error");
                        failedCase.setReason("배열 또는 문자열 인덱스 범위를 벗어남");
                    } else {
                        result.setErrorTypeHint("runtime_error");
                        failedCase.setReason("실행 중 오류 발생");
                    }

                    failedCases.add(failedCase);
                    result.setFailedCases(failedCases);

                    cleanup(tempDir);
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

                    cleanup(tempDir);
                    return result;
                }
            }

            cleanup(tempDir);

            result.setStatus("accepted");
            result.setErrorTypeHint(null);
            result.setFailedCases(List.of());
            return result;

        } catch (Exception e) {
            FailedCase failedCase = new FailedCase();
            failedCase.setInput("");
            failedCase.setExpectedOutput("");
            failedCase.setActualOutput("");
            failedCase.setReason("Java 실행 자체 실패");

            result.setStatus("runtime_error");
            result.setErrorTypeHint("runtime_error");
            result.setStdout("");
            result.setStderr(e.getMessage());
            result.setFailedCases(List.of(failedCase));

            cleanup(tempDir);
            return result;
        }
    }

    private String normalize(String text) {
        return text == null ? "" : text.strip().replace("\r\n", "\n");
    }

    private void cleanup(Path tempDir) {
        if (tempDir == null) return;

        try {
            Files.walk(tempDir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (Exception ignored) {
                        }
                    });
        } catch (Exception ignored) {
        }
    }
}