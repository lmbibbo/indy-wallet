package com.indy.wallet.repository;

import com.indy.wallet.model.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUidOrderByIdDesc(String uid);
    List<Investment> findByUidAndStatus(String uid, String status);
    List<Investment> findByStatus(String status);
}
