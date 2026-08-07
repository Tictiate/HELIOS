"""
Test script for HELIOS Scenario Engine.
"""

import sys
import os
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.services.scenario_engine import manager, engine

def test_scenario_engine():
    # 1. Base telemetry
    telemetry = {
        "tower_id": "T_TEST_01",
        "users": 100,
        "available_bandwidth_mbps": 50.0,
        "latency_ms": 30.0,
        "packet_loss_pct": 1.0,
        "power_usage_pct": 50.0,
        "temperature_c": 40.0,
        "cpu_usage_pct": 20.0,
        "traffic_load": 0.2
    }
    
    passed = 0
    failed = 0
    
    print("=" * 70)
    print(" SCENARIO ENGINE TEST RESULTS".center(70))
    print("=" * 70)

    # 2. Test manual queue
    success = manager.inject_manual("Tower Failure")
    if success:
        print("  ✅ Test 1 — Manual injection queued")
        passed += 1
    else:
        print("  ❌ Test 1 — Failed to queue manual injection")
        failed += 1
        
    popped = manager.pop_pending_scenario()
    if popped == "Tower Failure":
        print("  ✅ Test 2 — Manual injection popped")
        passed += 1
    else:
        print("  ❌ Test 2 — Failed to pop manual injection")
        failed += 1
        
    # 3. Test application of scenario
    mutated = engine.apply_scenario("Tower Failure", telemetry)
    if mutated["users"] == 0 and mutated["packet_loss_pct"] == 100.0:
        print("  ✅ Test 3 — 'Tower Failure' applied correctly")
        passed += 1
    else:
        print("  ❌ Test 3 — Failed to apply 'Tower Failure'")
        failed += 1
        
    # 4. Test schedule queue
    now = datetime.datetime.utcnow()
    # Schedule immediately
    manager.schedule("DDoS Attack", now - datetime.timedelta(seconds=1))
    popped2 = manager.pop_pending_scenario()
    if popped2 == "DDoS Attack":
        print("  ✅ Test 4 — Scheduled injection popped when due")
        passed += 1
    else:
        print("  ❌ Test 4 — Failed to pop scheduled injection")
        failed += 1
        
    mutated2 = engine.apply_scenario("DDoS Attack", telemetry)
    if mutated2["traffic_load"] == 1.0 and mutated2["cpu_usage_pct"] > 90.0:
        print("  ✅ Test 5 — 'DDoS Attack' applied correctly")
        passed += 1
    else:
        print("  ❌ Test 5 — Failed to apply 'DDoS Attack'")
        failed += 1
        
    # 5. Metadata generation
    metadata = engine.generate_metadata("DDoS Attack", telemetry, mutated2)
    if metadata["severity"] == "high" and metadata["affected_towers"] == ["T_TEST_01"]:
        print("  ✅ Test 6 — Metadata generated correctly")
        passed += 1
    else:
        print("  ❌ Test 6 — Failed to generate metadata")
        failed += 1
        
    total = passed + failed
    print(f"\\n{'='*70}")
    print(f"Scenario Engine Test Results: {passed}/{total} checks passed")
    if failed:
        sys.exit(1)
    else:
        print("🎉 All Scenario Engine Tests Passed!")
        
if __name__ == "__main__":
    test_scenario_engine()
