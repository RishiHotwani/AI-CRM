package com.nexusai.crm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NexusCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusCrmApplication.class, args);
    }
}
