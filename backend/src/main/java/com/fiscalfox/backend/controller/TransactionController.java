package com.fiscalfox.backend.controller;

import com.fiscalfox.backend.dto.TransactionDTO;
import com.fiscalfox.backend.entity.Transaction;
import com.fiscalfox.backend.repository.TransactionRepository;
import com.fiscalfox.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setDescription(transaction.getDescription());
        dto.setAmount(transaction.getAmount());
        dto.setDate(transaction.getDate());
        dto.setCategory(transaction.getCategory());
        dto.setType(transaction.getType());
        return dto;
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> getAllTransactions(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<TransactionDTO> transactions = transactionRepository.findByUser(userDetails.getUser())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody Transaction transaction, 
                                            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            transaction.setUser(userDetails.getUser());
            
            if (transaction.getAmount() <= 0) {
                return ResponseEntity.badRequest().body("Amount must be positive");
            }
            
            Transaction savedTransaction = transactionRepository.save(transaction);
            return ResponseEntity.ok(convertToDTO(savedTransaction));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating transaction: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<Transaction> transaction = transactionRepository.findById(id);
            
            if (transaction.isEmpty() || !transaction.get().getUser().getId().equals(userDetails.getUser().getId())) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(convertToDTO(transaction.get()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody Transaction updatedTransaction, 
                                                        Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<Transaction> existingTransaction = transactionRepository.findById(id);
            
            if (existingTransaction.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Transaction transaction = existingTransaction.get();
            if (!transaction.getUser().getId().equals(userDetails.getUser().getId())) {
                return ResponseEntity.notFound().build();
            }
            
            transaction.setDescription(updatedTransaction.getDescription());
            transaction.setAmount(updatedTransaction.getAmount());
            transaction.setDate(updatedTransaction.getDate());
            transaction.setCategory(updatedTransaction.getCategory());
            transaction.setType(updatedTransaction.getType());
            
            Transaction savedTransaction = transactionRepository.save(transaction);
            return ResponseEntity.ok(convertToDTO(savedTransaction));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating transaction: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Optional<Transaction> transaction = transactionRepository.findById(id);
            
            if (transaction.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            if (!transaction.get().getUser().getId().equals(userDetails.getUser().getId())) {
                return ResponseEntity.notFound().build();
            }
            
            transactionRepository.delete(transaction.get());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting transaction: " + e.getMessage());
        }
    }
}