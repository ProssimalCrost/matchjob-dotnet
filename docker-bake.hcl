variable "REGISTRY" {
  default = "matchjob"
}

variable "TAG" {
  default = "latest"
}

variable "NEXT_PUBLIC_API_URL" {
  default = "http://localhost:8080"
}

variable "NEXT_PUBLIC_SUPABASE_URL" {
  default = "https://placeholder.supabase.co"
}

variable "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" {
  default = "placeholder-key"
}

group "default" {
  targets = ["backend", "frontend", "mobile"]
}

target "backend" {
  context    = "."
  dockerfile = "./docker/backend/Dockerfile"
  target     = "runtime"
  tags       = ["${REGISTRY}/backend:${TAG}"]
}

target "frontend" {
  context    = "."
  dockerfile = "./docker/frontend/Dockerfile"
  target     = "runner"
  tags       = ["${REGISTRY}/frontend:${TAG}"]

  args = {
    NEXT_PUBLIC_API_URL                  = "${NEXT_PUBLIC_API_URL}"
    NEXT_PUBLIC_SUPABASE_URL             = "${NEXT_PUBLIC_SUPABASE_URL}"
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}"
  }
}

target "mobile" {
  context    = "."
  dockerfile = "./docker/mobile/Dockerfile"
  target     = "dev"
  tags       = ["${REGISTRY}/mobile:${TAG}"]
}
