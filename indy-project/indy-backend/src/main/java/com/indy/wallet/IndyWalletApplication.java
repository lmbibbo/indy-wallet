package com.indy.wallet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IndyWalletApplication {

	public static void main(String[] args) {
		SpringApplication.run(IndyWalletApplication.class, args);
	}

}
