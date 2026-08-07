import pytest
from fastapi import status

def test_create_device(client):
    response = client.post("/devices/", json={
        "name": "Router 1",
        "ip_address": "192.168.1.1",
        "device_type": "router",
        "location": "Datacenter A"
    })
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Router 1"
    assert data["status"] == "offline"
    assert "id" in data

def test_create_device_duplicate_name(client):
    device_data = {
        "name": "Switch 1",
        "ip_address": "10.0.0.1",
        "device_type": "switch"
    }
    client.post("/devices/", json=device_data)
    
    # Duplicate name, different IP
    response = client.post("/devices/", json={**device_data, "ip_address": "10.0.0.2"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "name already exists" in response.json()["detail"]

def test_get_all_devices(client):
    client.post("/devices/", json={
        "name": "Server 1",
        "ip_address": "10.1.1.1",
        "device_type": "server"
    })
    response = client.get("/devices/")
    assert response.status_code == status.HTTP_200_OK
    assert len(response.json()) >= 1

def test_update_device(client):
    create_response = client.post("/devices/", json={
        "name": "Base Station 1",
        "ip_address": "172.16.0.1",
        "device_type": "base_station"
    })
    device_id = create_response.json()["id"]

    update_response = client.put(f"/devices/{device_id}", json={
        "location": "Tower B"
    })
    assert update_response.status_code == status.HTTP_200_OK
    assert update_response.json()["location"] == "Tower B"

def test_change_device_status(client):
    create_response = client.post("/devices/", json={
        "name": "Router 2",
        "ip_address": "192.168.1.2",
        "device_type": "router"
    })
    device_id = create_response.json()["id"]

    patch_response = client.patch(f"/devices/{device_id}/status", json={
        "status": "online"
    })
    assert patch_response.status_code == status.HTTP_200_OK
    assert patch_response.json()["status"] == "online"

def test_delete_device(client):
    create_response = client.post("/devices/", json={
        "name": "Router 3",
        "ip_address": "192.168.1.3",
        "device_type": "router"
    })
    device_id = create_response.json()["id"]

    delete_response = client.delete(f"/devices/{device_id}")
    assert delete_response.status_code == status.HTTP_204_NO_CONTENT

    get_response = client.get(f"/devices/{device_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND
