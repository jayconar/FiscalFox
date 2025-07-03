package com.fiscalfox.backend.repository;

import com.fiscalfox.backend.entity.Transaction;
import com.fiscalfox.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
}