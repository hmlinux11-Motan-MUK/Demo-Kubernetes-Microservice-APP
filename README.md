<<<<<<< HEAD
# 🚀 Kubernetes Microservices E-Commerce Application

A production-style **microservices-based e-commerce platform** deployed on **Kubernetes**, built using Flask, PostgreSQL, Redis, Docker, and NGINX.

---

## 📌 Overview

This project demonstrates how to design, containerize, and deploy a **scalable microservices architecture** using Kubernetes.

It includes:
- Authentication (JWT-based)
- Product management
- Image upload service
- Redis caching
- PostgreSQL database
- NGINX frontend
- Kubernetes deployments + Ingress routing

---

## 🏗️ Architecture
  ┌───────────────┐
             │   Frontend    │
             │   (NGINX)     │
             └───────┬───────┘
                     │
              Ingress (ecommerce.local)
                     │

┌─────────────┬───────────────┬───────────────┐
│ Auth Service│ Product Service│ Upload Service│
│ (Flask) │ (Flask) │ (Flask) │
└──────┬──────┴──────┬────────┴──────┬────────┘
│ │ │
JWT Auth PostgreSQL File Storage
│
Redis Cache


---

## ⚙️ Tech Stack

- **Backend:** Python (Flask)
- **Frontend:** HTML, CSS, JavaScript, NGINX
- **Database:** PostgreSQL
- **Cache:** Redis
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **Routing:** NGINX Ingress
- **Authentication:** JWT

---

## 📁 Project Structure
ecommerce-website/
│
├── frontend/
├── auth-service/
├── product-service/
├── upload-service/
├── k8s/
│ ├── deployments/
│ ├── services/
│ ├── ingress.yaml
│ └── config/
│
├── docker-compose.microservices.yaml
└── README.md


---

## 🚀 Deployment (Kubernetes)

### 1. Start Minikube

```bash
minikube start
minikube addons enable ingress

sudo nano /etc/hosts

<MINIKUBE_IP> ecommerce.local

kubectl apply -f k8s/

kubectl get pods -n ecommerce
kubectl get ingress -n ecommerce

http://ecommerce.local/home.html
http://ecommerce.local/products.html?page=1
http://ecommerce.local/login.html
http://ecommerce.local/upload-product.html

🔐 Default Credentials
Username: admin
Password: admin123

🔄 Application Flow
User logs in (JWT token generated)
Upload image → Upload Service
Add product → Product Service
Product stored in PostgreSQL
Redis caches product responses
Frontend displays products via API

🧪 API Testing

Login
curl -X POST http://ecommerce.local/login \
-H "Content-Type: application/json" \
-d '{"username":"admin","password":"admin123"}'

Upload Image
curl -X POST http://ecommerce.local/upload \
-F "image=@image.jpg"

Add Product
curl -X POST http://ecommerce.local/add-product \
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json" \
-d '{ ... }'

📊 Logging & Monitoring

View logs

kubectl logs -n ecommerce deployment/product-service
kubectl logs -n ecommerce deployment/auth-service

Live logs (recommended)

kubetail -n ecommerce -t

🛠️ Features
✔ Microservices architecture
✔ Kubernetes deployments
✔ NGINX Ingress routing
✔ JWT authentication
✔ Image upload system
✔ Redis caching
✔ Persistent storage (PVC)
✔ Fully containerized services

👨‍💻 Author

Hamza Motan
Cloud Service Technical Specialist
=======
# Demo-Kubernetes-Microservice-APP
>>>>>>> 6bc3b920d4a8564440dee6fa27b003716ce01feb
