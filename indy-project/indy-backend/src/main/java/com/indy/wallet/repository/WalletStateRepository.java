package com.indy.wallet.repository;

import com.indy.wallet.model.WalletState;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletStateRepository extends JpaRepository<WalletState, String> {
}
