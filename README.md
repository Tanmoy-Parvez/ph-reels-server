# **PH Reels Server Documentation**

PH Reels Server is the robust backend for a dynamic video reels platform, delivering features like user authentication, seamless video upload, processing, storage, and management. Built with **TypeScript** and **Express**, it ensures efficient, scalable, and secure video handling—much like leading social media platforms.

---

## 🚀 **Features**

- **TypeScript-powered REST API** with comprehensive error handling
- **Advanced Video Processing:**
  - Supports **MP4 format** only
  - **Maximum Duration:** 60 seconds
  - **Maximum File Size:** 50MB
- **Optimized Caching** for quick video metadata retrieval
- **Rate limiting** implementation
- **Comprehensive Logging System** for API monitoring
- **Analytics Dashboard** for tracking video views and user engagement
- **JWT-based Authentication** supporting secure registration & login

---

## ⚙️ **Setup Instructions**

### **Prerequisites**

- **Docker** & **Docker Compose** must be installed.

### 1️⃣ **Clone the Repository**

```bash
git clone https://github.com/Tanmoy-Parvez/ph-reels-server.git
cd ph-reels-server
```

### 2️⃣ **Configure Environment Variables**

```bash
cp .env.example .env
```

- Update `.env` with critical values like `DB_URL`, `JWT_SECRET`, etc.

### 3️⃣ **Start the Application with Docker**

```bash
docker-compose up --build
```

- This command initiates all services: **Backend**, **Redis**, **MinIO**, and more.

### 4️⃣ **Access the Services**

- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **MinIO Console:** [http://localhost:9001](http://localhost:9001)
  - **Username:** `tanmoy`
  - **Password:** `tanmoy12`

---

# 📡 **API Documentation**

## 🔐 **Authentication**

### **Register User**

- **Endpoint:** `POST /api/v1/auth/register`

### **Login User**

- **Endpoint:** `POST /api/v1/auth/login`

---

## 🎬 **Video Management**

### **Upload Reel**

- **Endpoint:** `POST /api/v1/reel/upload`
- **Headers:** `Authorization: Bearer <token>`

### **Fetch All Reels**

- **Endpoint:** `GET /api/v1/reel`
- **Query Parameters:** `page`, `limit`

### **Fetch Reel by ID**

- **Endpoint:** `GET /api/v1/reel/:reelId`

### **Like/Unlike Reel**

- **Endpoint:** `POST /api/v1/reel/like/:reelId`
- **Headers:** `Authorization: Bearer <token>`

### **Delete Reel**

- **Endpoint:** `DELETE /api/v1/reel/:reelId`
- **Headers:** `Authorization: Bearer <token>`

---

## 📊 **Analytics**

### **Reel Analytics**

- **Endpoint:** `GET /api/v1/reel/analytics`
- **Query Params:** `dateRange` (e.g., `last7d`, `last30d`, `last1yr`)
- **Headers:** `Authorization: Bearer <token>`

---

🔗 [**API Documentation on POSTMAN**](https://documenter.getpostman.com/view/29107140/2sAYX3rifA)

---

## 🧩 **Architecture Overview**

- **Frontend:** Interfaces with the backend.
- **Backend:** Node.js + Express handling API requests.
- **Database:** MongoDB with Mongoose for schema modeling.
- **Cache:** Redis to speed up data retrieval.
- **Object Storage:** MinIO, S3-compatible.
- **Video Processing:** FFmpeg for encoding and thumbnail generation.

---

## 📈 **Technical Decisions**

### 1️⃣ **MongoDB + Mongoose**

- Flexible NoSQL structure ideal for dynamic data.
- Mongoose simplifies schema design and data validation.

### 2️⃣ **Redis**

- Enhances performance via efficient caching.

### 3️⃣ **MinIO**

- Scalable, S3-compatible object storage for video files.

### 4️⃣ **JWT Authentication**

- Secure, stateless authentication method.

### 5️⃣ **Docker & Docker Compose**

- Simplifies deployment, ensuring consistency across environments.

### 6️⃣ **FFmpeg**

- High-performance video encoding, transcoding, and thumbnail creation.

---

📬 **For any issues, feel free to contribute or raise issues in the repository.**
