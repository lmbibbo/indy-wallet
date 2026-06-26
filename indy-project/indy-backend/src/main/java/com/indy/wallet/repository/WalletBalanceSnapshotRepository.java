package com.indy.wallet.repository;

import com.indy.wallet.model.WalletBalanceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletBalanceSnapshotRepository extends JpaRepository<WalletBalanceSnapshot, Long> {

    Optional<WalletBalanceSnapshot> findTopByUidAndSimulatedDayOrderByCreatedAtDesc(String uid, int simulatedDay);

    Optional<WalletBalanceSnapshot> findTopByUidAndSimulatedDayLessThanEqualOrderBySimulatedDayDescCreatedAtDesc(String uid, int simulatedDay);
}
