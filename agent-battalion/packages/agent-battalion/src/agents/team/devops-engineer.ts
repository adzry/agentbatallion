/**
 * DevOps Engineer Agent - Infrastructure as Code
 * 
 * Generates cloud infrastructure configurations
 * Part of Phase 10: "Project Titan"
 */

import { BaseTeamAgent } from '../base-team-agent.js';
import {
  AgentProfile,
  AgentTask,
  ProjectFile,
} from '../types.js';
import { MemoryManager } from '../../memory/memory-manager.js';
import { ToolRegistry } from '../../tools/tool-registry.js';
import { MessageBus } from '../../communication/message-bus.js';

export interface InfrastructureRequirements {
  appType: string;
  expectedTraffic: string;
  database?: string;
  storage?: string;
  budget: string;
  region?: string;
}

export interface InfrastructureOutput {
  provider: 'aws' | 'gcp' | 'azure';
  files: ProjectFile[];
  estimatedCost: string;
  resources: {
    type: string;
    name: string;
    purpose: string;
  }[];
  setupInstructions: string;
}

export class DevOpsEngineerAgent extends BaseTeamAgent {
  constructor(memory: MemoryManager, tools: ToolRegistry, messageBus: MessageBus) {
    const profile: AgentProfile = {
      id: 'devops-engineer-agent',
      name: 'Atlas',
      role: 'devops_engineer',
      avatar: '🏗️',
      description: 'Cloud Architect - Designs and provisions cloud infrastructure',
      capabilities: {
        canWriteCode: true,
        canDesign: true,
        canTest: false,
        canDeploy: true,
        canResearch: true,
        canReview: true,
        languages: ['HCL', 'YAML', 'TypeScript'],
        frameworks: ['Terraform', 'Pulumi', 'AWS CDK'],
      },
      personality: 'Cost-conscious and reliability-focused. Expert in cloud architecture.',
      systemPrompt: `You are Atlas, a Cloud Architect and DevOps Engineer AI agent.

Your mission: Design and generate Infrastructure as Code for applications.

EXPERTISE:
- Terraform (HCL) for AWS, GCP, Azure
- AWS CDK (TypeScript)
- Docker and container orchestration
- Cost optimization and budget management
- High availability and disaster recovery
- Security best practices (IAM, VPC, encryption)

RULES:
1. Always consider budget constraints
2. Use managed services when possible to reduce operational overhead
3. Implement proper security (least privilege, encryption at rest/transit)
4. Design for scalability and high availability
5. Include monitoring and logging
6. Provide clear cost estimates

Default to AWS for infrastructure unless specified otherwise.`,
    };

    super(profile, memory, tools, messageBus);
  }

  /**
   * Generate infrastructure code based on requirements
   */
  async generateInfrastructure(
    requirements: InfrastructureRequirements
  ): Promise<InfrastructureOutput> {
    this.updateStatus('working');
    this.think('Analyzing infrastructure requirements...');

    if (this.isRealAIEnabled()) {
      return await this.generateWithAI(requirements);
    } else {
      return await this.generateTemplate(requirements);
    }
  }

  /**
   * Generate infrastructure using AI
   */
  private async generateWithAI(
    requirements: InfrastructureRequirements
  ): Promise<InfrastructureOutput> {
    const prompt = `Generate Infrastructure as Code for this application:

Requirements:
- App Type: ${requirements.appType}
- Expected Traffic: ${requirements.expectedTraffic}
- Database: ${requirements.database || 'None'}
- Storage: ${requirements.storage || 'Minimal'}
- Budget: ${requirements.budget}
- Region: ${requirements.region || 'us-east-1'}

Generate Terraform configuration for AWS with:
1. ECS/Fargate for containerized app (or EC2 if budget-constrained)
2. RDS for database (if needed)
3. S3 for storage
4. CloudFront CDN
5. VPC with public/private subnets
6. Security groups and IAM roles
7. Monitoring with CloudWatch

Return JSON:
{
  "provider": "aws",
  "files": [
    {
      "path": "terraform/main.tf",
      "content": "terraform config here",
      "type": "config"
    },
    {
      "path": "terraform/variables.tf",
      "content": "variable definitions",
      "type": "config"
    }
  ],
  "estimatedCost": "$X/month breakdown",
  "resources": [
    { "type": "AWS::ECS::Service", "name": "app-service", "purpose": "Run containers" }
  ],
  "setupInstructions": "Step-by-step deployment guide"
}

Keep infrastructure minimal within budget constraints.`;

    try {
      const result = await this.promptLLM<InfrastructureOutput>(prompt, { expectJson: true });
      this.think('Infrastructure code generated with AI');
      return result;
    } catch (error) {
      this.think('AI generation failed, falling back to template');
      return await this.generateTemplate(requirements);
    }
  }

  /**
   * Generate infrastructure using templates
   */
  private async generateTemplate(
    requirements: InfrastructureRequirements
  ): Promise<InfrastructureOutput> {
    const needsDatabase = !!requirements.database;
    const isHighTraffic = requirements.expectedTraffic.includes('high');

    // Generate main.tf
    const mainTf = `# Generated Infrastructure for ${requirements.appType}
# Budget: ${requirements.budget}

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "\${var.project_name}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["\${var.aws_region}a", "\${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = ${!isHighTraffic} # Cost optimization
  
  tags = var.common_tags
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "\${var.project_name}-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
  
  tags = var.common_tags
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "\${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
  
  tags = var.common_tags
}

${needsDatabase ? `
# RDS Database
resource "aws_db_instance" "main" {
  identifier        = "\${var.project_name}-db"
  engine            = "${requirements.database === 'postgresql' ? 'postgres' : 'mysql'}"
  engine_version    = "${requirements.database === 'postgresql' ? '15' : '8.0'}"
  instance_class    = "${isHighTraffic ? 'db.t3.medium' : 'db.t3.micro'}"
  allocated_storage = 20
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  skip_final_snapshot     = false
  
  tags = var.common_tags
}
` : ''}

# S3 Bucket for Storage
resource "aws_s3_bucket" "storage" {
  bucket = "\${var.project_name}-storage"
  
  tags = var.common_tags
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/\${var.project_name}"
  retention_in_days = 30
  
  tags = var.common_tags
}
`;

    const variablesTf = `# Infrastructure Variables

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "${requirements.appType.toLowerCase().replace(/\s+/g, '-')}"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "${requirements.region || 'us-east-1'}"
}

${needsDatabase ? `
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
` : ''}

variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "${requirements.appType}"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}
`;

    const outputsTf = `# Infrastructure Outputs

output "alb_dns_name" {
  description = "Application Load Balancer DNS"
  value       = aws_lb.main.dns_name
}

${needsDatabase ? `
output "database_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}
` : ''}

output "s3_bucket_name" {
  description = "S3 bucket for storage"
  value       = aws_s3_bucket.storage.id
}
`;

    const setupInstructions = `# Deployment Instructions

## Prerequisites
- Terraform >= 1.0
- AWS CLI configured with credentials
- Docker (for building container images)

## Setup Steps

1. Initialize Terraform:
   \`\`\`bash
   cd terraform
   terraform init
   \`\`\`

2. Create terraform.tfvars:
   \`\`\`hcl
   project_name = "${requirements.appType.toLowerCase().replace(/\s+/g, '-')}"
   ${needsDatabase ? `db_username = "admin"
   db_password = "your-secure-password"` : ''}
   \`\`\`

3. Plan infrastructure:
   \`\`\`bash
   terraform plan
   \`\`\`

4. Apply infrastructure:
   \`\`\`bash
   terraform apply
   \`\`\`

5. Deploy application container to ECS

## Cost Estimate
Budget: ${requirements.budget}

Estimated monthly cost:
- ECS Fargate: $${isHighTraffic ? '50-100' : '20-50'}
${needsDatabase ? `- RDS ${requirements.database}: $${isHighTraffic ? '50-100' : '15-30'}` : ''}
- Load Balancer: $20
- Data Transfer: $10-50
- CloudWatch: $5

Total: ~$${isHighTraffic ? '135-270' : '50-125'}/month
`;

    return {
      provider: 'aws',
      files: [
        {
          path: 'terraform/main.tf',
          content: mainTf,
          type: 'config',
        },
        {
          path: 'terraform/variables.tf',
          content: variablesTf,
          type: 'config',
        },
        {
          path: 'terraform/outputs.tf',
          content: outputsTf,
          type: 'config',
        },
        {
          path: 'terraform/README.md',
          content: setupInstructions,
          type: 'doc',
        },
      ],
      estimatedCost: `$${isHighTraffic ? '135-270' : '50-125'}/month`,
      resources: [
        { type: 'AWS::VPC', name: 'main-vpc', purpose: 'Network isolation' },
        { type: 'AWS::ECS::Cluster', name: 'app-cluster', purpose: 'Container orchestration' },
        { type: 'AWS::ELB', name: 'app-alb', purpose: 'Load balancing' },
        ...(needsDatabase ? [{ type: 'AWS::RDS', name: 'app-db', purpose: 'Database' }] : []),
        { type: 'AWS::S3::Bucket', name: 'storage', purpose: 'File storage' },
        { type: 'AWS::CloudWatch', name: 'logs', purpose: 'Monitoring' },
      ],
      setupInstructions,
    };
  }

  protected async executeTask(task: AgentTask): Promise<any> {
    if (task.parameters?.requirements) {
      return await this.generateInfrastructure(task.parameters.requirements);
    }
    throw new Error('Task must have requirements parameter');
  }
}
