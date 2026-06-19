package com.glpi.kanbanconfig.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "ticket_supercost")
public class TicketSupercost {

    public static final String MOVEMENT_SUPERCOST = "SUPERCOST";
    public static final String MOVEMENT_REOPEN = "REOPEN";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Integer ticketId;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "movement_type", nullable = false)
    private String movementType = MOVEMENT_SUPERCOST;

    @Column(name = "mode" , nullable = true)
    private int mode ;

    public TicketSupercost() {
    }

    public TicketSupercost(Integer ticketId, Double amount, String movementType, String createdAt) {
        this.ticketId = ticketId;
        this.amount = amount;
        this.movementType = movementType;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getTicketId() {
        return ticketId;
    }

    public void setTicketId(Integer ticketId) {
        this.ticketId = ticketId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getMovementType() {
        return movementType;
    }

    public void setMovementType(String movementType) {
        this.movementType = movementType;
    }
    public int getMode(){
       return this.mode;
    }
    public void setMode(int mode){
        this.mode = mode;
    }
}
