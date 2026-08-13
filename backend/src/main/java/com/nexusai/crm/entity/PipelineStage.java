package com.nexusai.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pipeline_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PipelineStage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id", nullable = false)
    private Pipeline pipeline;

    @Column(nullable = false)
    private String name;

    @Column(name = "stage_order", nullable = false)
    private int stageOrder;

    @Column(name = "win_probability", nullable = false)
    @Builder.Default
    private int winProbability = 10;

    @Column(name = "is_won_stage", nullable = false)
    @Builder.Default
    private boolean isWonStage = false;

    @Column(name = "is_lost_stage", nullable = false)
    @Builder.Default
    private boolean isLostStage = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
