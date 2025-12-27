
import React from 'react';
import { LayoutDashboard, Container, Workflow, BarChart3, ShieldCheck, History, Cloud, Beaker } from 'lucide-react';
import { CodeSnippet, NavItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Architecture Overview', icon: <LayoutDashboard size={20} /> },
  { id: 'sandbox', label: 'Architect Sandbox', icon: <Beaker size={20} /> },
  { id: 'containers', label: 'Docker & Kubernetes', icon: <Container size={20} /> },
  { id: 'pipelines', label: 'ML Pipelines & CI/CD', icon: <Workflow size={20} /> },
  { id: 'monitoring', label: 'Grafana & Metrics', icon: <BarChart3 size={20} /> },
  { id: 'security', label: 'Security & DR', icon: <ShieldCheck size={20} /> },
  { id: 'cost', label: 'Cost Optimization', icon: <Cloud size={20} /> },
];

export const SNIPPETS: Record<string, CodeSnippet[]> = {
  containers: [
    {
      id: 'dockerfile',
      title: 'Dockerfile for ML Model',
      language: 'dockerfile',
      description: 'Standardized environment for model inference using Azure ML base images.',
      content: `FROM mcr.microsoft.com/azureml/base:intelmpi2018.3-ubuntu18.04

RUN apt-get update && apt-get install -y \\
    python3.8 \\
    python3-pip \\
    nginx \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .

RUN pip3 install --no-cache-dir -r requirements.txt \\
    && pip3 install \\
    azureml-sdk \\
    inference-schema \\
    numpy \\
    pandas \\
    scikit-learn \\
    onnxruntime

COPY model.pkl .
COPY score.py .
COPY nginx.conf /etc/nginx/sites-available/default

EXPOSE 5001

CMD service nginx start && \\
    gunicorn --bind=0.0.0.0:5001 --workers=4 score:app`
    },
    {
      id: 'k8s-deploy',
      title: 'AKS Secure Deployment (Auth & AuthZ)',
      language: 'yaml',
      description: 'Production-grade manifest with Service, Ingress (Azure AD Auth), and JWT secrets.',
      content: `apiVersion: v1
kind: Secret
metadata:
  name: ml-auth-secrets
  namespace: ai-ml-prod
type: Opaque
data:
  # Base64 encoded placeholders for JWT validation
  JWT_ISSUER: YXp1cmUtYWQ=
  JWT_AUDIENCE: bWwtbW9kZWwtYXBp
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-model-deployment
  namespace: ai-ml-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-model
  template:
    metadata:
      labels:
        app: ml-model
    spec:
      containers:
      - name: ml-model-container
        image: acrname.azurecr.io/ml-model:v1.0.0
        ports:
        - containerPort: 5001
        envFrom:
        - secretRef:
            name: ml-auth-secrets
        resources:
          requests:
            memory: "2Gi"
            cpu: "1"
          limits:
            memory: "4Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /health
            port: 5001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: ml-model-service
  namespace: ai-ml-prod
spec:
  selector:
    app: ml-model
  ports:
  - port: 80
    targetPort: 5001
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ml-model-ingress
  namespace: ai-ml-prod
  annotations:
    # Integration with Azure Application Gateway (AGIC)
    kubernetes.io/ingress.class: azure/application-gateway
    # Enabling Azure AD Authentication via OpenID Connect
    appgw.ingress.kubernetes.io/auth-type: "oauth2"
    appgw.ingress.kubernetes.io/auth-id: "azure-ad-provider"
spec:
  rules:
  - http:
      paths:
      - path: /score
        pathType: Prefix
        backend:
          service:
            name: ml-model-service
            port:
              number: 80
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ml-model-hpa
  namespace: ai-ml-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ml-model-deployment
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70`
    }
  ],
  pipelines: [
    {
      id: 'aml-pipeline',
      title: 'AML Python SDK Pipeline',
      language: 'python',
      description: 'Orchestrating model training and deployment to AKS using Azure ML SDK.',
      content: `from azureml.core import Workspace, Experiment, Environment
from azureml.core.compute import AksCompute, ComputeTarget
from azureml.core.model import Model, InferenceConfig
from azureml.core.webservice import AksWebservice

ws = Workspace.from_config()

# Configure AKS deployment
aks_config = AksWebservice.deploy_configuration(
    cpu_cores=1,
    memory_gb=2,
    autoscale_enabled=True,
    autoscale_min_replicas=3,
    autoscale_max_replicas=10,
    autoscale_target_utilization=70,
    auth_enabled=True,
    enable_app_insights=True
)

# Deploy model
model = Model(ws, name='best-model', version=1)
service = Model.deploy(
    workspace=ws,
    name='ml-model-service',
    models=[model],
    inference_config=inference_config,
    deployment_config=aks_config,
    deployment_target=aks_target,
    overwrite=True
)

service.wait_for_deployment(show_output=True)`
    },
    {
      id: 'azure-pipelines',
      title: 'Azure DevOps CI/CD',
      language: 'yaml',
      description: 'Multi-stage pipeline for automated builds, testing, and AKS deployment.',
      content: `trigger:
  branches:
    include:
    - main

variables:
  azureSubscription: 'AI-Infra-Subscription'
  aksName: 'ai-infra-aks'
  imageRepository: 'mlmodel'

stages:
- stage: Build
  jobs:
  - job: Build
    steps:
    - task: Docker@2
      inputs:
        command: 'buildAndPush'
        repository: '$(imageRepository)'
        tags: '$(Build.BuildId)'

- stage: Deploy
  jobs:
  - job: Deploy
    steps:
    - task: KubernetesManifest@0
      inputs:
        action: 'deploy'
        namespace: 'ai-ml-prod'
        manifests: 'kubernetes/manifests/deployment.yml'
        imagePullSecrets: 'acr-secret'
        containers: '$(containerRegistry)/$(imageRepository):$(Build.BuildId)'`
    }
  ],
  monitoring: [
    {
      id: 'prometheus-config',
      title: 'Prometheus Configuration',
      language: 'yaml',
      description: 'Scraping metrics from Kubernetes pods and Azure ML endpoints.',
      content: `global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'azureml-metrics'
    static_configs:
      - targets: ['azureml-metrics-service:9090']
    
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
    - role: pod
    relabel_configs:
    - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
      action: keep
      regex: true`
    }
  ],
  security: [
    {
      id: 'security-config',
      title: 'Security Configuration',
      language: 'yaml',
      description: 'Hardening the infrastructure with Private Clusters and AAD integration.',
      content: `security:
  network:
    privateCluster: true
    authorizedIPRanges:
      - "10.0.0.0/8"
    networkPolicy: "calico"
    
  identity:
    managedIdentity: true
    aadIntegration: true
    podIdentity:
      enabled: true
      
  secrets:
    keyVaultIntegration: true
    secretsStoreCSIDriver: true`
    },
    {
      id: 'apim-policy',
      title: 'Azure API Management Policy',
      language: 'yaml',
      description: 'XML snippet for APIM to handle JWT validation and Rate Limiting.',
      content: `<policies>
  <inbound>
    <base />
    <validate-jwt header-name="Authorization" failed-validation-httpcode="401">
      <openid-config url="https://login.microsoftonline.com/{{tenant-id}}/v2.0/.well-known/openid-configuration" />
      <audiences>
        <audience>{{client-id}}</audience>
      </audiences>
    </validate-jwt>
    <rate-limit-by-key calls="100" renewal-period="60" counter-key="@(context.Request.IpAddress)" />
  </inbound>
  <backend>
    <base />
  </backend>
  <outbound>
    <base />
  </outbound>
  <on-error>
    <base />
  </on-error>
</policies>`
    }
  ],
  cost: [
    {
      id: 'cost-optimization',
      title: 'Cost Policies',
      language: 'yaml',
      description: 'Strategies for maximizing ROI through Spot Instances and auto-scaling.',
      content: `resourceOptimization:
  aksStrategies:
    - useSpotInstances: true
      spotMaxPrice: -1
    - clusterAutoscaler:
        enabled: true
        minCount: 3
        maxCount: 15
        
  azureMLStrategies:
    - computeInstance:
        autoStop: true
        idleTime: 30
    - computeCluster:
        vmPriority: LowPriority`
    }
  ]
};
