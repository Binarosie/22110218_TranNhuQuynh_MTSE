const { sequelize } = require('../config/database');
const { User, Role, Position, Building, Block, Floor, Apartment, Facility } = require('../models');

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        // Force sync database (recreate tables)
        await sequelize.sync({ force: true });
        console.log('Database synced successfully');

        // Create Roles for apartment rental system
        const roles = await Role.bulkCreate([
            {
                name: 'Admin',
                description: 'Full system access and user management',
                isActive: true
            },
            {
                name: 'Manager', 
                description: 'Building and facility management access',
                isActive: true
            },
            {
                name: 'User',
                description: 'Tenant access - can book facility repairs',
                isActive: true
            }
        ]);
        console.log('Roles created successfully');

        // Create Positions for apartment rental system
        const positions = await Position.bulkCreate([
            {
                title: 'System Administrator',
                description: 'Manages entire building management system',
                department: 'Administration',
                salary: 85000.00,
                isActive: true
            },
            {
                title: 'Building Manager',
                description: 'Manages building operations and tenant relations',
                department: 'Building Management',
                salary: 65000.00,
                isActive: true
            },
            {
                title: 'Facility Manager',
                description: 'Manages facility maintenance and repair bookings',
                department: 'Facility Management',
                salary: 55000.00,
                isActive: true
            },
            {
                title: 'Booking Manager',
                description: 'Manages facility booking schedules and assignments',
                department: 'Operations',
                salary: 50000.00,
                isActive: true
            },
            {
                title: 'Landlord',
                description: 'Property owner who rents out apartments',
                department: 'Property Management',
                salary: 0.00,
                isActive: true
            },
            {
                title: 'Tenant',
                description: 'Apartment renter who can book facility services',
                department: 'Residents',
                salary: 0.00,
                isActive: true
            }
        ]);
        console.log('Positions created successfully');

        // Create Users for apartment rental system
        const users = await User.bulkCreate([
            {
                firstName: 'Admin',
                lastName: 'System',
                email: 'admin@building.com',
                password: 'admin123',
                phone: '+84901000001',
                address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
                dateOfBirth: '1985-01-01',
                roleId: roles[0].id, // Admin role
                positionId: positions[0].id, // System Administrator
                isActive: true
            },
            {
                firstName: 'Nguyễn',
                lastName: 'Văn Quản',
                email: 'manager@building.com',
                password: 'manager123',
                phone: '+84901000002',
                address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
                dateOfBirth: '1980-05-15',
                roleId: roles[1].id, // Manager role
                positionId: positions[1].id, // Building Manager
                isActive: true
            },
            {
                firstName: 'Trần',
                lastName: 'Thị Sửa',
                email: 'facility@building.com',
                password: 'facility123',
                phone: '+84901000003',
                address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
                dateOfBirth: '1988-08-20',
                roleId: roles[1].id, // Manager role
                positionId: positions[2].id, // Facility Manager
                isActive: true
            },
            {
                firstName: 'Lê',
                lastName: 'Văn Dân',
                email: 'tenant1@gmail.com',
                password: 'tenant123',
                phone: '+84901000004',
                address: 'Căn 0101 - Block S.01',
                dateOfBirth: '1990-12-10',
                roleId: roles[2].id, // User role (tenant)
                positionId: positions[5].id, // Tenant
                isActive: true
            },
            {
                firstName: 'Huỳnh',
                lastName: 'Thành Duy',
                email: 'student@gmail.com',
                password: 'student123',
                phone: '+84901000005',
                address: 'Căn 0102 - Block S.01',
                dateOfBirth: '1995-03-25',
                roleId: roles[2].id, // User role (tenant)
                positionId: positions[5].id, // Tenant
                isActive: true
            },
            {
                firstName: 'Phạm',
                lastName: 'Thu Hà',
                email: 'landlord1@gmail.com',
                password: 'landlord123',
                phone: '+84901000006',
                address: 'Chủ sở hữu nhiều căn hộ',
                dateOfBirth: '1975-07-30',
                roleId: roles[1].id, // Manager role (can manage their properties)
                positionId: positions[4].id, // Landlord
                isActive: true
            }
        ], { individualHooks: true });
        console.log('Users created successfully');


        // --- Block / Building / Floor / Apartment / Household / Facility seeding ---
        console.log('\nSeeding building and block data...');

        // Create a top-level building complex (acts as container for blocks)
        const complex = await Building.create({
            name: 'Khu S Complex',
            address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
            description: 'Khu chung cư mẫu S - test data',
            isActive: true
        });

        // Create 10 blocks under this complex: S.01 .. S.10
        const blocks = [];
        for (let i = 1; i <= 10; i++) {
            const code = `S.${i.toString().padStart(2, '0')}`;
            const b = await Block.create({ name: `Block ${code}`, buildingId: complex.id });
            blocks.push(b);
        }

        // Create floors for the first block (sample)
        const floors = [];
        const firstBlock = blocks[0];
        for (let f = 1; f <= 20; f++) {
            const floor = await Floor.create({ number: f, blockId: firstBlock.id });
            floors.push(floor);
        }

        // Create apartments for floors 1-3 (8 apartments per floor) as sample data
        const apartments = [];
        for (let floorIndex = 0; floorIndex < 3; floorIndex++) {
            const floor = floors[floorIndex];
            for (let aptNumber = 1; aptNumber <= 8; aptNumber++) {
                const aptNumStr = `${(floorIndex + 1).toString().padStart(2, '0')}${aptNumber.toString().padStart(2, '0')}`;
                
                // Assign tenants to specific apartments
                let tenantId = null;
                let leaseStart = null;
                let leaseEnd = null;
                
                if (aptNumStr === '0101') {
                    tenantId = users.find(u => u.email === 'tenant1@gmail.com').id;
                    leaseStart = new Date('2024-01-01');
                    leaseEnd = new Date('2025-12-31');
                } else if (aptNumStr === '0102') {
                    tenantId = users.find(u => u.email === 'student@gmail.com').id;
                    leaseStart = new Date('2024-06-01');
                    leaseEnd = new Date('2025-05-31');
                }
                
                const apt = await Apartment.create({ 
                    number: aptNumStr, 
                    floorId: floor.id, 
                    area: 60 + floorIndex * 1.5, 
                    status: tenantId ? 'occupied' : 'vacant',
                    tenantId: tenantId,
                    monthlyRent: 8000000 + floorIndex * 500000, // VND
                    leaseStartDate: leaseStart,
                    leaseEndDate: leaseEnd
                });
                apartments.push(apt);
            }
        }

        // Create facilities for apartment maintenance and repair
        const facilities = await Facility.bulkCreate([
            { name: 'Điện nước', description: 'Sửa chữa hệ thống điện, nước trong căn hộ', quantity: 1 },
            { name: 'Điều hòa', description: 'Bảo trì, sửa chữa điều hòa không khí', quantity: 1 },
            { name: 'Thang máy', description: 'Bảo trì thang máy chung', quantity: 2 },
            { name: 'Vệ sinh chung', description: 'Dọn dẹp khu vực chung', quantity: 1 },
            { name: 'An ninh', description: 'Dịch vụ bảo vệ và giám sát', quantity: 1 }
        ]);

        console.log('Database seeding completed successfully!');
        console.log('\nSeeded Data Summary:');
        console.log(`- ${roles.length} roles created (Admin, Manager, User)`);
        console.log(`- ${positions.length} positions created`);
        console.log(`- ${users.length} users created`);
        console.log(`- 1 building complex created`);
        console.log(`- ${blocks.length} blocks created`);
        console.log(`- ${floors.length} floors created for first block`);
        console.log(`- ${apartments.length} apartments created with tenant assignments`);
        console.log(`- ${facilities.length} facilities created for maintenance`);

        console.log('\nTest Credentials:');
        console.log('Admin: admin@building.com / admin123');
        console.log('Manager: manager@building.com / manager123');
        console.log('Facility Manager: facility@building.com / facility123');
        console.log('Tenant 1: tenant1@gmail.com / tenant123');
        console.log('Tenant 2: student@gmail.com / student123');
        console.log('Landlord: landlord1@gmail.com / landlord123');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

// Run seeder if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;