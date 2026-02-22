import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@scf.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@scf.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const riskManager = await prisma.user.upsert({
    where: { email: 'risk@scf.com' },
    update: {},
    create: {
      username: 'risk_manager',
      email: 'risk@scf.com',
      passwordHash,
      role: 'RISK_MANAGER',
    },
  });

  const creditOfficer = await prisma.user.upsert({
    where: { email: 'credit@scf.com' },
    update: {},
    create: {
      username: 'credit_officer',
      email: 'credit@scf.com',
      passwordHash,
      role: 'CREDIT_OFFICER',
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operator@scf.com' },
    update: {},
    create: {
      username: 'operator',
      email: 'operator@scf.com',
      passwordHash,
      role: 'OPERATOR',
    },
  });

  console.log('Users created:', { admin: admin.id, riskManager: riskManager.id, creditOfficer: creditOfficer.id, operator: operator.id });

  // Create enterprises
  const enterprises = await Promise.all([
    prisma.enterprise.upsert({
      where: { unifiedCode: '91110000MA0A1B2C3D' },
      update: {},
      create: {
        name: '北京华创科技有限公司',
        unifiedCode: '91110000MA0A1B2C3D',
        contactPerson: '张三',
        contactPhone: '13800138001',
        address: '北京市朝阳区建国路88号',
        industry: '电子商务',
        registeredCapital: 5000000,
      },
    }),
    prisma.enterprise.upsert({
      where: { unifiedCode: '91310000MA0E5F6G7H' },
      update: {},
      create: {
        name: '上海鼎盛贸易有限公司',
        unifiedCode: '91310000MA0E5F6G7H',
        contactPerson: '李四',
        contactPhone: '13800138002',
        address: '上海市浦东新区陆家嘴环路100号',
        industry: '零售',
        registeredCapital: 10000000,
      },
    }),
    prisma.enterprise.upsert({
      where: { unifiedCode: '91440000MA0I9J0K1L' },
      update: {},
      create: {
        name: '深圳智汇电子有限公司',
        unifiedCode: '91440000MA0I9J0K1L',
        contactPerson: '王五',
        contactPhone: '13800138003',
        address: '深圳市南山区科技园南区',
        industry: '制造业',
        registeredCapital: 8000000,
      },
    }),
    prisma.enterprise.upsert({
      where: { unifiedCode: '91330000MA0M1N2O3P' },
      update: {},
      create: {
        name: '杭州云联物流有限公司',
        unifiedCode: '91330000MA0M1N2O3P',
        contactPerson: '赵六',
        contactPhone: '13800138004',
        address: '杭州市余杭区未来科技城',
        industry: '物流',
        registeredCapital: 3000000,
      },
    }),
    prisma.enterprise.upsert({
      where: { unifiedCode: '91510000MA0Q5R6S7T' },
      update: {},
      create: {
        name: '成都绿源农业有限公司',
        unifiedCode: '91510000MA0Q5R6S7T',
        contactPerson: '孙七',
        contactPhone: '13800138005',
        address: '成都市武侯区天府大道999号',
        industry: '农业',
        registeredCapital: 2000000,
      },
    }),
  ]);

  console.log('Enterprises created:', enterprises.length);

  // Create orders for each enterprise
  const now = new Date();
  const orders = [];

  for (let i = 0; i < enterprises.length; i++) {
    const ent = enterprises[i];
    for (let j = 0; j < 5; j++) {
      const createdAt = new Date(now.getTime() - (30 - j * 5) * 24 * 60 * 60 * 1000);
      const dueDate = new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      const statuses = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'COMPLETED'] as const;
      const status = statuses[Math.min(j, statuses.length - 1)];

      const order = await prisma.order.create({
        data: {
          orderNo: `ORD-2026${String(i + 1).padStart(2, '0')}-${String(j + 1).padStart(4, '0')}`,
          enterpriseId: ent.id,
          amount: Math.round((50000 + Math.random() * 200000) * 100) / 100,
          status,
          dueDate,
          overdueDays: 0,
          isReturned: j === 4 && i === 3, // One returned order for the 4th enterprise
          createdAt,
        },
      });
      orders.push(order);
    }
  }

  // Create one overdue order for testing
  const overdueOrder = await prisma.order.create({
    data: {
      orderNo: 'ORD-202600-OVERDUE',
      enterpriseId: enterprises[0].id,
      amount: 150000,
      status: 'DELIVERED',
      dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      overdueDays: 3,
      financingStatus: 'DISBURSED',
      createdAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Orders created:', orders.length + 1);

  // Create credit applications
  await Promise.all([
    prisma.creditApplication.create({
      data: {
        applicationNo: 'CA-20260101-0001',
        enterpriseId: enterprises[0].id,
        requestedAmount: 500000,
        status: 'APPROVED',
        approvedAmount: 450000,
        reviewerId: riskManager.id,
        reviewNote: 'Enterprise has good transaction history',
        reviewedAt: new Date(),
      },
    }),
    prisma.creditApplication.create({
      data: {
        applicationNo: 'CA-20260115-0002',
        enterpriseId: enterprises[1].id,
        requestedAmount: 800000,
        status: 'PENDING',
      },
    }),
    prisma.creditApplication.create({
      data: {
        applicationNo: 'CA-20260201-0003',
        enterpriseId: enterprises[2].id,
        requestedAmount: 300000,
        status: 'UNDER_REVIEW',
      },
    }),
  ]);

  console.log('Credit applications created');

  // Create credit limits
  await Promise.all([
    prisma.creditLimit.upsert({
      where: { enterpriseId: enterprises[0].id },
      update: {},
      create: {
        enterpriseId: enterprises[0].id,
        totalLimit: 500000,
        usedLimit: 150000,
        availableLimit: 350000,
        suggestedLimit: 520000,
        algorithm: 'v1.0',
        calculationData: {
          avgMonthlyVolume: 320000,
          transactionCount: 45,
          growthRate: 0.12,
          overdueRate: 0,
          returnRate: 0.02,
          latePaymentRatio: 0.05,
          flowScore: 0.85,
          riskMultiplier: 0.95,
          industryFactor: 1.1,
        },
        lastCalculatedAt: new Date(),
      },
    }),
    prisma.creditLimit.upsert({
      where: { enterpriseId: enterprises[1].id },
      update: {},
      create: {
        enterpriseId: enterprises[1].id,
        totalLimit: 800000,
        usedLimit: 200000,
        availableLimit: 600000,
        algorithm: 'v1.0',
        lastCalculatedAt: new Date(),
      },
    }),
    prisma.creditLimit.upsert({
      where: { enterpriseId: enterprises[2].id },
      update: {},
      create: {
        enterpriseId: enterprises[2].id,
        totalLimit: 300000,
        usedLimit: 50000,
        availableLimit: 250000,
        algorithm: 'v1.0',
        lastCalculatedAt: new Date(),
      },
    }),
  ]);

  console.log('Credit limits created');

  // Create sample e-commerce flows
  for (const ent of enterprises.slice(0, 3)) {
    for (let month = 0; month < 3; month++) {
      for (let tx = 0; tx < 15; tx++) {
        const txDate = new Date(now.getFullYear(), now.getMonth() - month, 1 + tx * 2);
        await prisma.ecommerceFlow.create({
          data: {
            enterpriseId: ent.id,
            platform: ['淘宝', '京东', '拼多多'][tx % 3],
            transactionDate: txDate,
            amount: Math.round((5000 + Math.random() * 30000) * 100) / 100,
            transactionType: tx % 10 === 0 ? 'REFUND' : 'SALE',
            orderRef: `EXT-${txDate.getTime()}-${tx}`,
          },
        });
      }
    }
  }

  console.log('E-commerce flows created');

  // Create sample documents
  const contractDoc = await prisma.document.create({
    data: {
      documentNo: 'DOC-20260101-0001',
      type: 'CONTRACT',
      orderId: orders[0].id,
      fileName: 'contract_001.pdf',
      fileUrl: '/uploads/sample_contract.pdf',
      fileSize: 256000,
      mimeType: 'application/pdf',
      extractedData: {
        amount: '150000.00',
        date: '2026-01-01',
        partyA: '北京华创科技有限公司',
        partyB: '上海鼎盛贸易有限公司',
        goods: '电子元件, 集成电路',
        quantity: '500',
      },
      extractedAmount: 150000,
      extractedPartyA: '北京华创科技有限公司',
      extractedPartyB: '上海鼎盛贸易有限公司',
      status: 'EXTRACTED',
    },
  });

  const invoiceDoc = await prisma.document.create({
    data: {
      documentNo: 'DOC-20260101-0002',
      type: 'INVOICE',
      orderId: orders[0].id,
      fileName: 'invoice_001.pdf',
      fileUrl: '/uploads/sample_invoice.pdf',
      fileSize: 128000,
      mimeType: 'application/pdf',
      extractedData: {
        amount: '150000.00',
        date: '2026-01-05',
        partyA: '北京华创科技有限公司',
        partyB: '上海鼎盛贸易有限公司',
        goods: '电子元件, 集成电路',
        quantity: '500',
        invoiceNo: 'INV-2026-001',
      },
      extractedAmount: 150000,
      extractedPartyA: '北京华创科技有限公司',
      extractedPartyB: '上海鼎盛贸易有限公司',
      status: 'EXTRACTED',
    },
  });

  const logisticsDoc = await prisma.document.create({
    data: {
      documentNo: 'DOC-20260101-0003',
      type: 'LOGISTICS_BILL',
      orderId: orders[0].id,
      fileName: 'logistics_001.pdf',
      fileUrl: '/uploads/sample_logistics.pdf',
      fileSize: 64000,
      mimeType: 'application/pdf',
      extractedData: {
        amount: '150000.00',
        date: '2026-01-10',
        partyA: '北京华创科技有限公司',
        partyB: '上海鼎盛贸易有限公司',
        goods: '电子元件, 集成电路',
        quantity: '500',
        waybillNo: 'WB-2026-001',
      },
      extractedAmount: 150000,
      extractedPartyA: '北京华创科技有限公司',
      extractedPartyB: '上海鼎盛贸易有限公司',
      status: 'EXTRACTED',
    },
  });

  console.log('Documents created:', { contractDoc: contractDoc.id, invoiceDoc: invoiceDoc.id, logisticsDoc: logisticsDoc.id });

  // Create sample risk events
  await prisma.riskEvent.create({
    data: {
      eventNo: 'RE-20260201-0001',
      enterpriseId: enterprises[0].id,
      type: 'OVERDUE',
      severity: 'CRITICAL',
      description: `Order ${overdueOrder.orderNo} is overdue by 3 days. Enterprise account frozen.`,
      triggerRule: 'OVERDUE_1DAY_FREEZE',
      triggerValue: '3 days',
      thresholdValue: '1 day',
      action: 'FREEZE',
      status: 'PENDING',
    },
  });

  await prisma.riskEvent.create({
    data: {
      eventNo: 'RE-20260201-0002',
      enterpriseId: enterprises[3].id,
      type: 'HIGH_RETURN_RATE',
      severity: 'HIGH',
      description: 'Enterprise return rate is 22.5%, exceeding the 15% threshold.',
      triggerRule: 'RETURN_RATE_15_BLOCK',
      triggerValue: '22.5%',
      thresholdValue: '15%',
      action: 'BLOCK',
      status: 'PROCESSING',
    },
  });

  console.log('Risk events created');
  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
