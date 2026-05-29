package com.indy.wallet.repository;

import com.indy.wallet.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUidOrderByIdDesc(String uid);
}
