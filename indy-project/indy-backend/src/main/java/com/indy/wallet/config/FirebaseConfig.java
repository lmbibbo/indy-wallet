package com.indy.wallet.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                // To keep it simple and easy for the user, we look for serviceAccountKey.json
                // or use application default credentials if not found.
                GoogleCredentials credentials;
                try {
                    FileInputStream serviceAccount = new FileInputStream("serviceAccountKey.json");
                    credentials = GoogleCredentials.fromStream(serviceAccount);
                } catch (IOException e) {
                    // Fallback to default credentials if file is not found
                    credentials = GoogleCredentials.getApplicationDefault();
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .build();

                FirebaseApp.initializeApp(options);
            }
        } catch (Exception e) {
            System.err.println("Error initializing Firebase Admin SDK: " + e.getMessage());
        }
    }
}
