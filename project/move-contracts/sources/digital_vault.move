// Digital Vault Smart Contract for Aptos Blockchain
// Implements time-locked and geo-locked secure capsules

module digital_vault::vault {
    use std::signer;
    use std::vector;
    use std::string::{Self, String};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;

    // Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_CAPSULE_NOT_FOUND: u64 = 2;
    const E_TIME_LOCK_ACTIVE: u64 = 3;
    const E_GEO_LOCK_ACTIVE: u64 = 4;
    const E_INVALID_LOCATION: u64 = 5;
    const E_CAPSULE_ALREADY_UNLOCKED: u64 = 6;

    // Capsule priority levels
    const PRIORITY_STANDARD: u8 = 0;
    const PRIORITY_CLASSIFIED: u8 = 1;
    const PRIORITY_TOP_SECRET: u8 = 2;

    // Capsule structure
    struct Capsule has key, store, copy, drop {
        id: u64,
        owner: address,
        title: String,
        description: String,
        ipfs_hash: String,
        encrypted_key: String,
        unlock_timestamp: u64,
        has_geo_lock: bool,
        latitude: u64,  // Stored as micro-degrees (multiply by 1,000,000)
        longitude: u64, // Stored as micro-degrees (multiply by 1,000,000)
        radius: u64,    // Radius in meters
        priority: u8,
        created_at: u64,
        is_unlocked: bool,
    }

    // User's capsule collection
    struct UserCapsules has key {
        capsules: vector<Capsule>,
        next_capsule_id: u64,
    }

    // Global capsule registry
    struct CapsuleRegistry has key {
        total_capsules: u64,
    }

    // Events
    struct CapsuleCreatedEvent has drop, store {
        capsule_id: u64,
        owner: address,
        title: String,
        unlock_timestamp: u64,
        has_geo_lock: bool,
    }

    struct CapsuleUnlockedEvent has drop, store {
        capsule_id: u64,
        owner: address,
        unlocked_by: address,
        unlock_timestamp: u64,
    }

    // Initialize the module
    fun init_module(account: &signer) {
        move_to(account, CapsuleRegistry {
            total_capsules: 0,
        });
    }

    // Initialize user capsules storage
    public entry fun initialize_user(account: &signer) {
        let user_addr = signer::address_of(account);
        if (!exists<UserCapsules>(user_addr)) {
            move_to(account, UserCapsules {
                capsules: vector::empty<Capsule>(),
                next_capsule_id: 1,
            });
        };
    }

    // Create a time-locked capsule
    public entry fun create_time_capsule(
        account: &signer,
        title: String,
        description: String,
        ipfs_hash: String,
        unlock_timestamp: u64,
        priority: u8,
        encrypted_key: String,
    ) acquires UserCapsules, CapsuleRegistry {
        let user_addr = signer::address_of(account);
        
        // Initialize user if needed
        if (!exists<UserCapsules>(user_addr)) {
            initialize_user(account);
        };

        let user_capsules = borrow_global_mut<UserCapsules>(user_addr);
        let capsule_id = user_capsules.next_capsule_id;
        
        let capsule = Capsule {
            id: capsule_id,
            owner: user_addr,
            title,
            description,
            ipfs_hash,
            encrypted_key,
            unlock_timestamp,
            has_geo_lock: false,
            latitude: 0,
            longitude: 0,
            radius: 0,
            priority,
            created_at: timestamp::now_seconds(),
            is_unlocked: false,
        };

        vector::push_back(&mut user_capsules.capsules, capsule);
        user_capsules.next_capsule_id = capsule_id + 1;

        // Update global registry
        let registry = borrow_global_mut<CapsuleRegistry>(@digital_vault);
        registry.total_capsules = registry.total_capsules + 1;

        // Emit event
        event::emit(CapsuleCreatedEvent {
            capsule_id,
            owner: user_addr,
            title,
            unlock_timestamp,
            has_geo_lock: false,
        });
    }

    // Create a geo-locked capsule (with optional time lock)
    public entry fun create_geo_capsule(
        account: &signer,
        title: String,
        description: String,
        ipfs_hash: String,
        unlock_timestamp: u64,
        latitude: u64,
        longitude: u64,
        radius: u64,
        priority: u8,
        encrypted_key: String,
    ) acquires UserCapsules, CapsuleRegistry {
        let user_addr = signer::address_of(account);
        
        // Initialize user if needed
        if (!exists<UserCapsules>(user_addr)) {
            initialize_user(account);
        };

        let user_capsules = borrow_global_mut<UserCapsules>(user_addr);
        let capsule_id = user_capsules.next_capsule_id;
        
        let capsule = Capsule {
            id: capsule_id,
            owner: user_addr,
            title,
            description,
            ipfs_hash,
            encrypted_key,
            unlock_timestamp,
            has_geo_lock: true,
            latitude,
            longitude,
            radius,
            priority,
            created_at: timestamp::now_seconds(),
            is_unlocked: false,
        };

        vector::push_back(&mut user_capsules.capsules, capsule);
        user_capsules.next_capsule_id = capsule_id + 1;

        // Update global registry
        let registry = borrow_global_mut<CapsuleRegistry>(@digital_vault);
        registry.total_capsules = registry.total_capsules + 1;

        // Emit event
        event::emit(CapsuleCreatedEvent {
            capsule_id,
            owner: user_addr,
            title,
            unlock_timestamp,
            has_geo_lock: true,
        });
    }

    // Unlock a time-locked capsule
    public entry fun unlock_time_capsule(
        account: &signer,
        capsule_owner: address,
        capsule_id: u64,
    ) acquires UserCapsules {
        let user_addr = signer::address_of(account);
        let user_capsules = borrow_global_mut<UserCapsules>(capsule_owner);
        
        let capsule_ref = find_capsule_mut(&mut user_capsules.capsules, capsule_id);
        assert!(!capsule_ref.is_unlocked, E_CAPSULE_ALREADY_UNLOCKED);
        assert!(timestamp::now_seconds() >= capsule_ref.unlock_timestamp, E_TIME_LOCK_ACTIVE);
        assert!(!capsule_ref.has_geo_lock, E_GEO_LOCK_ACTIVE);

        capsule_ref.is_unlocked = true;

        // Emit event
        event::emit(CapsuleUnlockedEvent {
            capsule_id,
            owner: capsule_owner,
            unlocked_by: user_addr,
            unlock_timestamp: timestamp::now_seconds(),
        });
    }

    // Unlock a geo-locked capsule
    public entry fun unlock_geo_capsule(
        account: &signer,
        capsule_owner: address,
        capsule_id: u64,
        user_latitude: u64,
        user_longitude: u64,
    ) acquires UserCapsules {
        let user_addr = signer::address_of(account);
        let user_capsules = borrow_global_mut<UserCapsules>(capsule_owner);
        
        let capsule_ref = find_capsule_mut(&mut user_capsules.capsules, capsule_id);
        assert!(!capsule_ref.is_unlocked, E_CAPSULE_ALREADY_UNLOCKED);
        assert!(timestamp::now_seconds() >= capsule_ref.unlock_timestamp, E_TIME_LOCK_ACTIVE);
        assert!(capsule_ref.has_geo_lock, E_GEO_LOCK_ACTIVE);

        // Verify location is within allowed radius
        let distance = calculate_distance(
            user_latitude,
            user_longitude,
            capsule_ref.latitude,
            capsule_ref.longitude
        );
        assert!(distance <= capsule_ref.radius, E_INVALID_LOCATION);

        capsule_ref.is_unlocked = true;

        // Emit event
        event::emit(CapsuleUnlockedEvent {
            capsule_id,
            owner: capsule_owner,
            unlocked_by: user_addr,
            unlock_timestamp: timestamp::now_seconds(),
        });
    }

    // View functions
    #[view]
    public fun get_user_capsules(user_addr: address): vector<Capsule> acquires UserCapsules {
        if (!exists<UserCapsules>(user_addr)) {
            return vector::empty<Capsule>()
        };
        
        let user_capsules = borrow_global<UserCapsules>(user_addr);
        user_capsules.capsules
    }

    #[view]
    public fun get_capsule_details(owner: address, capsule_id: u64): Capsule acquires UserCapsules {
        let user_capsules = borrow_global<UserCapsules>(owner);
        let capsule_ref = find_capsule(&user_capsules.capsules, capsule_id);
        *capsule_ref
    }

    #[view]
    public fun can_unlock_capsule(
        owner: address,
        capsule_id: u64,
        user_latitude: u64,
        user_longitude: u64
    ): bool acquires UserCapsules {
        let user_capsules = borrow_global<UserCapsules>(owner);
        let capsule_ref = find_capsule(&user_capsules.capsules, capsule_id);
        
        if (capsule_ref.is_unlocked) {
            return false
        };

        // Check time lock
        if (timestamp::now_seconds() < capsule_ref.unlock_timestamp) {
            return false
        };

        // Check geo lock if applicable
        if (capsule_ref.has_geo_lock) {
            let distance = calculate_distance(
                user_latitude,
                user_longitude,
                capsule_ref.latitude,
                capsule_ref.longitude
            );
            return distance <= capsule_ref.radius
        };

        true
    }

    #[view]
    public fun get_total_capsules(): u64 acquires CapsuleRegistry {
        let registry = borrow_global<CapsuleRegistry>(@digital_vault);
        registry.total_capsules
    }

    // Helper functions
    fun find_capsule(capsules: &vector<Capsule>, capsule_id: u64): &Capsule {
        let len = vector::length(capsules);
        let i = 0;
        while (i < len) {
            let capsule = vector::borrow(capsules, i);
            if (capsule.id == capsule_id) {
                return capsule
            };
            i = i + 1;
        };
        abort E_CAPSULE_NOT_FOUND
    }

    fun find_capsule_mut(capsules: &mut vector<Capsule>, capsule_id: u64): &mut Capsule {
        let len = vector::length(capsules);
        let i = 0;
        while (i < len) {
            let capsule = vector::borrow_mut(capsules, i);
            if (capsule.id == capsule_id) {
                return capsule
            };
            i = i + 1;
        };
        abort E_CAPSULE_NOT_FOUND
    }

    // Simplified distance calculation (Haversine formula approximation)
    fun calculate_distance(lat1: u64, lon1: u64, lat2: u64, lon2: u64): u64 {
        // Convert micro-degrees to degrees and calculate approximate distance
        // This is a simplified version - in production, use more precise calculation
        let lat_diff = if (lat1 > lat2) { lat1 - lat2 } else { lat2 - lat1 };
        let lon_diff = if (lon1 > lon2) { lon1 - lon2 } else { lon2 - lon1 };
        
        // Approximate distance in meters (very simplified)
        // 1 degree ≈ 111,000 meters, so 1 micro-degree ≈ 0.111 meters
        let lat_distance = lat_diff / 9009; // Approximate conversion
        let lon_distance = lon_diff / 9009;
        
        // Pythagorean approximation
        let distance_squared = lat_distance * lat_distance + lon_distance * lon_distance;
        
        // Simple square root approximation
        sqrt_approximation(distance_squared)
    }

    // Simple square root approximation using binary search
    fun sqrt_approximation(n: u64): u64 {
        if (n == 0) return 0;
        if (n == 1) return 1;
        
        let start = 1;
        let end = n;
        let result = 0;
        
        while (start <= end) {
            let mid = (start + end) / 2;
            if (mid * mid == n) {
                return mid
            };
            
            if (mid * mid < n) {
                start = mid + 1;
                result = mid;
            } else {
                end = mid - 1;
            };
        };
        
        result
    }
}