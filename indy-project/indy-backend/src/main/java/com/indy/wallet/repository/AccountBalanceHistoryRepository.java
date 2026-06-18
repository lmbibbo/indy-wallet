package com.indy.wallet.repository;

import com.indy.wallet.model.AccountBalanceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountBalanceHistoryRepository extends JpaRepository<AccountBalanceHistory, Long> {

    List<AccountBalanceHistory> findAllByOrderByTimestampAsc();

}
