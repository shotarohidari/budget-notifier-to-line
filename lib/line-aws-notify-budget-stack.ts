import * as cdk from 'aws-cdk-lib';
import { CfnBudget } from 'aws-cdk-lib/aws-budgets';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';
import {config} from "dotenv";
config();
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class LineAwsNotifyBudgetStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const topic = new Topic(this, 'BillingAlarmTopic');

    topic.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['SNS:Publish'],
        principals: [new ServicePrincipal('budgets.amazonaws.com')],
        resources: [topic.topicArn],
    }));

    new CfnBudget(this, 'CfnBudgetCost', {
      budget: {
        budgetType: 'COST',
        timeUnit: 'MONTHLY',
        budgetLimit: {
          amount: 14,
          unit: 'USD',
        },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            comparisonOperator: 'GREATER_THAN',
            notificationType: 'ACTUAL',
            threshold: 60,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [{
            subscriptionType: 'SNS',
            address: topic.topicArn,
          }],
        },
        {
          notification: {
            comparisonOperator: 'GREATER_THAN',
            notificationType: 'ACTUAL',
            threshold: 80,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [{
            subscriptionType: 'SNS',
            address: topic.topicArn,
          }],
        },
        {
          notification: {
            comparisonOperator: 'GREATER_THAN',
            notificationType: 'ACTUAL',
            threshold: 100,
            thresholdType: 'PERCENTAGE',
          },
          subscribers: [{
            subscriptionType: 'SNS',
            address: topic.topicArn,
          }],
        }
      ],
    });

    const lambda = new NodejsFunction(this,"notify-handler",{
      handler:"handler",
      entry:"./lib/src/lambda/notifyHandler.ts",
      environment:{
        ACCESS_TOKEN:process.env.ACCESS_TOKEN || "",
        USER_ID:process.env.USER_ID || "",
      }
    });

    lambda.addEventSource(new SnsEventSource(topic,{
    }))
  }
}
