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
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class CJudgeService {

    private static final long TIME_LIMIT_SECONDS = 3;

    public JudgeResult judge(String code, List<TestCase> testCases) {
        JudgeResult result = new JudgeResult();
        result.setCompileOutput("");
        result.setExecutionTimeMs(0);
        result.setMemoryKb(0);

        List<FailedCase> failedCases = new ArrayList<>();

        Path tempDir = null;

        try {
            tempDir = Files.createTempDirectory("c_submission_");

            Path sourceFile = tempDir.resolve("Main.c");
            Path exeFile = isWindows()
                    ? tempDir.resolve("Main.exe")
                    : tempDir.resolve("Main");

            Files.writeString(sourceFile, code, StandardCharsets.UTF_8);

            ProcessBuilder compilePb = new ProcessBuilder(
                    "gcc",
                    sourceFile.toAbsolutePath().toString(),
                    "-O2",
                    "-std=c11",
                    "-o",
                    exeFile.toAbsolutePath().toString()
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

            boolean compileFinished = compileProcess.waitFor(
                    TIME_LIMIT_SECONDS,
                    TimeUnit.SECONDS
            );

            if (!compileFinished) {
                compileProcess.destroyForcibly();

                result.setStatus("compile_error");
                result.setErrorTypeHint("compile_error");
                result.setStdout("");
                result.setStderr("C 컴파일 시간이 초과되었습니다.");
                result.setCompileOutput("C 컴파일 시간이 초과되었습니다.");

                FailedCase failedCase = new FailedCase();
                failedCase.setInput("");
                failedCase.setExpectedOutput("");
                failedCase.setActualOutput("");
                failedCase.setReason("C 컴파일 시간 초과");

                failedCases.add(failedCase);
                result.setFailedCases(failedCases);

                return result;
            }

            int compileExitCode = compileProcess.exitValue();
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
                failedCase.setReason("C 컴파일 오류");

                failedCases.add(failedCase);
                result.setFailedCases(failedCases);

                return result;
            }

            for (TestCase tc : testCases) {
                ProcessBuilder runPb = new ProcessBuilder(
                        exeFile.toAbsolutePath().toString()
                );

                runPb.directory(tempDir.toFile());

                long start = System.currentTimeMillis();
                Process process = runPb.start();

                String input = tc.getInput() == null ? "" : tc.getInput();

                if (!input.endsWith("\n")) {
                    input += "\n";
                }

                try (OutputStream os = process.getOutputStream()) {
                    os.write(input.getBytes(StandardCharsets.UTF_8));
                    os.flush();
                }

                boolean finished = process.waitFor(
                        TIME_LIMIT_SECONDS,
                        TimeUnit.SECONDS
                );

                if (!finished) {
                    process.destroyForcibly();

                    FailedCase failedCase = new FailedCase();
                    failedCase.setInput(tc.getInput());
                    failedCase.setExpectedOutput(tc.getExpectedOutput());
                    failedCase.setActualOutput("");
                    failedCase.setReason("C 실행 시간 초과");

                    result.setStatus("runtime_error");
                    result.setErrorTypeHint("runtime_error");
                    result.setStdout("");
                    result.setStderr("C 실행 시간이 초과되었습니다.");
                    result.setExecutionTimeMs((int) (System.currentTimeMillis() - start));
                    result.setFailedCases(List.of(failedCase));

                    return result;
                }

                long elapsed = System.currentTimeMillis() - start;

                String stdout = new String(
                        process.getInputStream().readAllBytes(),
                        StandardCharsets.UTF_8
                );

                String stderr = new String(
                        process.getErrorStream().readAllBytes(),
                        StandardCharsets.UTF_8
                );

                int exitCode = process.exitValue();

                result.setStdout(stdout);
                result.setStderr(stderr);
                result.setExecutionTimeMs((int) elapsed);

                FailedCase failedCase = new FailedCase();
                failedCase.setInput(tc.getInput());
                failedCase.setExpectedOutput(tc.getExpectedOutput());
                failedCase.setActualOutput(normalize(stdout));

                if (exitCode != 0) {
                    result.setStatus("runtime_error");
                    result.setErrorTypeHint("runtime_error");
                    failedCase.setReason("실행 중 오류 발생: " + normalize(stderr));

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
            failedCase.setReason("C 실행 자체 실패: " + e.getMessage());

            result.setStatus("runtime_error");
            result.setErrorTypeHint("runtime_error");
            result.setStdout("");
            result.setStderr(e.getMessage());
            result.setFailedCases(List.of(failedCase));

            return result;
        } finally {
            cleanup(tempDir);
        }
    }

    private boolean isWindows() {
        return System.getProperty("os.name")
                .toLowerCase()
                .contains("win");
    }

    private String normalize(String text) {
        return text == null ? "" : text.strip().replace("\r\n", "\n");
    }

    private void cleanup(Path tempDir) {
        if (tempDir == null) return;

        try {
            Files.walk(tempDir)
                    .sorted(Comparator.reverseOrder())
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