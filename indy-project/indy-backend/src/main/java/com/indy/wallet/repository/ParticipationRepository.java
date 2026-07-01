package com.indy.wallet.repository;

import com.indy.wallet.model.Participation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    Optional<Participation> findByUid(String uid);
    List<Participation> findByFundId(Long fundId);
}
