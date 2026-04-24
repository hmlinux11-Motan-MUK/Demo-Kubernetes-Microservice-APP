pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-creds'
        SONAR_PROJECT_KEY = 'ecommerce-k8s-app'
        SONAR_HOST_URL = 'http://localhost:9000'

        FRONTEND_IMAGE = 'hmlinux11/ecommerce-frontend'
        AUTH_IMAGE = 'hmlinux11/auth-service'
        PRODUCT_IMAGE = 'hmlinux11/product-service'
        UPLOAD_IMAGE = 'hmlinux11/upload-service'

        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_NAMESPACE = 'ecommerce'
        APP_URL = 'http://ecommerce.local/home.html'

        ALERT_EMAIL = 'hm.linux11@gmail.com'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube SAST Scan') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    sh '''
                        docker run --rm \
                          --network host \
                          -e SONAR_HOST_URL=$SONAR_HOST_URL \
                          -e SONAR_TOKEN=$SONAR_TOKEN \
                          -v "$PWD:/usr/src" \
                          sonarsource/sonar-scanner-cli \
                          -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                          -Dsonar.projectName=$SONAR_PROJECT_KEY \
                          -Dsonar.sources=/usr/src \
                          -Dsonar.exclusions=**/node_modules/**,**/.git/**,**/trivy-report/**,**/zap-report/**,**/dependency-check-report/**
                    '''
                }
            }
        }

        stage('GitLeaks Secret Scan') {
            steps {
                sh '''
                    mkdir -p gitleaks-report

                    docker run --rm \
                        -v "$PWD:/repo" \
                        zricethezav/gitleaks:latest \
                        detect \
                        --source="/repo" \
                        --report-format=json \
                        --report-path="/repo/gitleaks-report/gitleaks-report.json" \
                        --no-git || true

                    ls -l gitleaks-report || true
                    cat gitleaks-report/gitleaks-report.json || true
                '''
             }
        }

        stage('OWASP Dependency Scan') {
            steps {
                sh '''
                    mkdir -p dependency-check-report

                    docker run --rm \
                      -v "$PWD:/src" \
                      -v "$PWD/dependency-check-report:/report" \
                      owasp/dependency-check:latest \
                      --scan /src \
                      --format HTML \
                      --out /report \
                      --disableAssembly || true
                '''
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                sh '''
                    mkdir -p trivy-report

                    docker run --rm \
                      -v "$PWD:/project" \
                      -v "$PWD/trivy-report:/report" \
                      aquasec/trivy fs \
                      --severity HIGH,CRITICAL \
                      --format table \
                      --output /report/trivy-filesystem.txt \
                      --exit-code 0 \
                      /project

                    cat trivy-report/trivy-filesystem.txt || true
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKERHUB_CREDENTIALS}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker build -t $FRONTEND_IMAGE:$IMAGE_TAG ./frontend
                    docker build -t $AUTH_IMAGE:$IMAGE_TAG ./auth-service
                    docker build -t $PRODUCT_IMAGE:$IMAGE_TAG ./product-service
                    docker build -t $UPLOAD_IMAGE:$IMAGE_TAG ./upload-service

                    docker tag $FRONTEND_IMAGE:$IMAGE_TAG $FRONTEND_IMAGE:latest
                    docker tag $AUTH_IMAGE:$IMAGE_TAG $AUTH_IMAGE:latest
                    docker tag $PRODUCT_IMAGE:$IMAGE_TAG $PRODUCT_IMAGE:latest
                    docker tag $UPLOAD_IMAGE:$IMAGE_TAG $UPLOAD_IMAGE:latest
                '''
            }
        }

        stage('Trivy Image Scan') {
            steps {
                sh '''
                    mkdir -p trivy-report

                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/trivy-report:/report" aquasec/trivy image \
                      --severity HIGH,CRITICAL \
                      --format table \
                      --output /report/frontend-image.txt \
                      --exit-code 0 \
                      $FRONTEND_IMAGE:$IMAGE_TAG

                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/trivy-report:/report" aquasec/trivy image \
                      --severity HIGH,CRITICAL \
                      --format table \
                      --output /report/auth-image.txt \
                      --exit-code 0 \
                      $AUTH_IMAGE:$IMAGE_TAG

                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/trivy-report:/report" aquasec/trivy image \
                      --severity HIGH,CRITICAL \
                      --format table \
                      --output /report/product-image.txt \
                      --exit-code 0 \
                      $PRODUCT_IMAGE:$IMAGE_TAG

                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/trivy-report:/report" aquasec/trivy image \
                      --severity HIGH,CRITICAL \
                      --format table \
                      --output /report/upload-image.txt \
                      --exit-code 0 \
                      $UPLOAD_IMAGE:$IMAGE_TAG

                    cat trivy-report/*.txt || true
                '''
            }
        }

        stage('Push Docker Images') {
            steps {
                sh '''
                    docker push $FRONTEND_IMAGE:$IMAGE_TAG
                    docker push $AUTH_IMAGE:$IMAGE_TAG
                    docker push $PRODUCT_IMAGE:$IMAGE_TAG
                    docker push $UPLOAD_IMAGE:$IMAGE_TAG

                    docker push $FRONTEND_IMAGE:latest
                    docker push $AUTH_IMAGE:latest
                    docker push $PRODUCT_IMAGE:latest
                    docker push $UPLOAD_IMAGE:latest
                '''
            }
        }

        stage('Deploy Kubernetes Manifests') {
            steps {
                sh '''
                    kubectl apply -f k8s/namespace.yaml
                    kubectl apply -f k8s/configmap.yaml
                    kubectl apply -f k8s/secret.yaml
                    kubectl apply -f k8s/postgres-pvc.yaml
                    kubectl apply -f k8s/postgres-deployment.yaml
                    kubectl apply -f k8s/postgres-service.yaml
                    kubectl apply -f k8s/redis-deployment.yaml
                    kubectl apply -f k8s/redis-service.yaml
                    kubectl apply -f k8s/auth-deployment.yaml
                    kubectl apply -f k8s/auth-service.yaml
                    kubectl apply -f k8s/product-deployment.yaml
                    kubectl apply -f k8s/product-service.yaml
                    kubectl apply -f k8s/upload-pvc.yaml
                    kubectl apply -f k8s/upload-deployment.yaml
                    kubectl apply -f k8s/upload-service.yaml
                    kubectl apply -f k8s/frontend-deployment.yaml
                    kubectl apply -f k8s/frontend-service.yaml
                    kubectl apply -f k8s/ingress.yaml
                '''
            }
        }

        stage('Update Kubernetes Images') {
            steps {
                sh '''
                    kubectl set image deployment/frontend frontend=$FRONTEND_IMAGE:$IMAGE_TAG -n $K8S_NAMESPACE
                    kubectl set image deployment/auth-service auth-service=$AUTH_IMAGE:$IMAGE_TAG -n $K8S_NAMESPACE
                    kubectl set image deployment/product-service product-service=$PRODUCT_IMAGE:$IMAGE_TAG -n $K8S_NAMESPACE
                    kubectl set image deployment/upload-service upload-service=$UPLOAD_IMAGE:$IMAGE_TAG -n $K8S_NAMESPACE
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set +e

                    kubectl rollout status deployment/frontend -n $K8S_NAMESPACE
                    FRONTEND_STATUS=$?

                    kubectl rollout status deployment/auth-service -n $K8S_NAMESPACE
                    AUTH_STATUS=$?

                    kubectl rollout status deployment/product-service -n $K8S_NAMESPACE
                    PRODUCT_STATUS=$?

                    kubectl rollout status deployment/upload-service -n $K8S_NAMESPACE
                    UPLOAD_STATUS=$?

                    if [ $FRONTEND_STATUS -ne 0 ]; then
                        kubectl rollout undo deployment/frontend -n $K8S_NAMESPACE
                        exit 1
                    fi

                    if [ $AUTH_STATUS -ne 0 ]; then
                        kubectl rollout undo deployment/auth-service -n $K8S_NAMESPACE
                        exit 1
                    fi

                    if [ $PRODUCT_STATUS -ne 0 ]; then
                        kubectl rollout undo deployment/product-service -n $K8S_NAMESPACE
                        exit 1
                    fi

                    if [ $UPLOAD_STATUS -ne 0 ]; then
                        kubectl rollout undo deployment/upload-service -n $K8S_NAMESPACE
                        exit 1
                    fi

                    kubectl get pods -n $K8S_NAMESPACE
                    kubectl get ingress -n $K8S_NAMESPACE
                '''
            }
        }

        stage('OWASP ZAP DAST Scan') {
            steps {
                sh '''
                    mkdir -p zap-report

                    docker run --rm \
                      --network host \
                      -v "$PWD/zap-report:/zap/wrk" \
                      ghcr.io/zaproxy/zaproxy:stable \
                      zap-baseline.py \
                      -t $APP_URL \
                      -r zap-report.html \
                      -I || true
                '''
            }
        }
    }

    post {
        always {
            sh 'ls -R trivy-report dependency-check-report zap-report || true'

            archiveArtifacts artifacts: 'trivy-report/**/*,dependency-check-report/**/*,zap-report/**/*,gitleaks-report/**/*', allowEmptyArchive: true

            sh 'docker logout || true'
        }

        success {
            echo 'DevSecOps CI/CD pipeline completed successfully.'
        }

        failure {
            echo 'DevSecOps CI/CD pipeline failed. Check Jenkins logs.'

            emailext(
                subject: "FAILED: DevSecOps Pipeline - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """Pipeline failed.

Job: ${env.JOB_NAME}
Build: #${env.BUILD_NUMBER}
URL: ${env.BUILD_URL}

Security reports attached if generated.
""",
                to: "${ALERT_EMAIL}",
                attachmentsPattern: "trivy-report/**/*.txt,dependency-check-report/**/*.html,zap-report/**/*.html,gitleaks-report/**/*.json"
            )
        }
    }
}