```
Festival
├── GeneralInfo
│   ├── Name
│   ├── Location
│   ├── StartDate
│   ├── EndDate
│   └── Status
│
├── Schedule
│   ├── Day
│   │   ├── Date
│   │   ├── Stage
│   │   │   ├── Name
│   │   │   ├── Capacity
│   │   │   └── Performance
│   │   │       ├── Artist
│   │   │       ├── TimeSlot
│   │   │       │   ├── StartTime
│   │   │       │   └── EndTime
│   │   │       └── TechnicalRequirements
│   │   │           ├── PowerRequirements
│   │   │           ├── SoundChannels
│   │   │           ├── LightingNeeds
│   │   │           └── SpecialEffects
│   │   │
│   │   └── Logistics
│   │       ├── LoadInTime
│   │       ├── LoadOutTime
│   │       └── SecurityPlanReference
│
├── Resources
│   ├── Staff
│   │   ├── Name
│   │   ├── Role
│   │   ├── Skills
│   │   └── Availability
│   │
│   ├── Equipment
│   │   ├── Name
│   │   ├── Category
│   │   ├── Quantity
│   │   └── AssignedStage
│   │
│   └── Vendors
│       ├── Name
│       ├── ContractStartDate
│       ├── ContractEndDate
│       └── ServicesProvided
│
├── TicketTypes
│   └── TicketType
│       ├── Name
│       ├── Price
│       ├── AccessLevel
│       ├── ValidDays
│       └── CapacityLimit
│
└── Compliance
    ├── SafetyPlan
    │   ├── DocumentReference
    │   ├── ApprovalStatus
    │   └── LastReviewDate
    │
    ├── Insurance
    │   ├── PolicyNumber
    │   ├── CoverageType
    │   └── ExpiryDate
    │
    └── Permits
        ├── PermitType
        ├── IssuingAuthority
        ├── IssueDate
        └── ExpiryDate
```

# Festival Planning Domain Model

This model represents a multi-day festival production system.  
Each Festival is structured as a tree of nested entities, allowing complex scheduling, resource management, and compliance tracking.

---

## Festival
Root entity representing a single festival.

- GeneralInfo
- Schedule
- Resources
- TicketTypes
- Compliance

---

## GeneralInfo
Basic metadata about the festival.

- Name
- Location
- StartDate
- EndDate
- Description
- Status

---

## Schedule
Defines the structure of the festival across multiple days and stages.

### Day
Represents one calendar day of the festival.

- Date
- Stages
- Logistics

#### Stage
A physical or virtual stage within a day.

- Name
- Capacity
- Performances

##### Performance
A single scheduled act or activity.

- Artist
- TimeSlot
- TechnicalRequirements

###### TimeSlot
- StartTime
- EndTime

###### TechnicalRequirements (collapsible subtree)
- PowerRequirements
- SoundChannels
- LightingNeeds
- SpecialEffects
- StagePlotReference

#### Logistics
Operational details for a specific day.

- LoadInTime
- LoadOutTime
- SecurityPlanReference
- CateringArrangements

---

## Resources
Entities required to run the festival.

### Staff
- Name
- Role
- Skills
- Availability

### Equipment
- Name
- Category
- Quantity
- AssignedStage

### Vendors
- Name
- ContractStartDate
- ContractEndDate
- ServicesProvided

---

## TicketTypes
Defines the commercial ticket offerings.

### TicketType
- Name
- Price
- AccessLevel
- ValidDays
- CapacityLimit

Examples:
- EarlyBird
- Standard
- VIP
- GroupPackage

---

## Compliance
Legal and regulatory requirements.

### SafetyPlan
- DocumentReference
- ApprovalStatus
- LastReviewDate

### Insurance
- PolicyNumber
- CoverageType
- ExpiryDate

### Permits
- PermitType
- IssuingAuthority
- IssueDate
- ExpiryDate


