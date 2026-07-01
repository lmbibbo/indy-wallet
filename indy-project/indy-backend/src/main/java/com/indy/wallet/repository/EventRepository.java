package com.indy.wallet.repository;

import com.indy.wallet.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByUidOrderByIdDesc(String uid);
    List<Event> findByUidAndDayBetweenOrderByDayAsc(String uid, int fromDay, int toDay);
    List<Event> findByTypeAndDayBetweenOrderByDayAsc(String type, int fromDay, int toDay);
}
