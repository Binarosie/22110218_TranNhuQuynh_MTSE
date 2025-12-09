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
                description: 'Full system access - CRUD all, assign technicians to bookings',
                isActive: true
            },
            {
                name: 'Technician', 
                description: 'Thợ sửa - View assigned bookings and update status to FIXED',
                isActive: true
            },
            {
                name: 'User',
                description: 'Tenant - Rent apartments, create facility repair bookings, confirm DONE',
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
                title: 'Thợ sửa điện',
                description: 'Electrician - Fixes electrical facilities in apartments',
                department: 'Maintenance',
                salary: 45000.00,
                isActive: true
            },
            {
                title: 'Thợ sửa nước',
                description: 'Plumber - Fixes plumbing facilities in apartments',
                department: 'Maintenance',
                salary: 45000.00,
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
                firstName: 'Nguyễn',
                lastName: 'Văn An',
                email: 'admin@building.com',
                password: 'password123',
                phone: '+84901000001',
                address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
                dateOfBirth: '1985-01-01',
                roleId: roles[0].id, // Admin role
                positionId: positions[0].id, // System Administrator
                isActive: true,
                hasRentedApartment: false
            },
            {
                firstName: 'Trần',
                lastName: 'Văn Bình',
                email: 'electrician@building.com',
                password: 'password123',
                phone: '+84901000002',
                address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
                dateOfBirth: '1990-05-15',
                roleId: roles[1].id, // Technician role
                positionId: positions[1].id, // Thợ sửa điện
                isActive: true,
                hasRentedApartment: false
            },
            {
                firstName: 'Lê',
                lastName: 'Văn Cường',
                email: 'plumber@building.com',
                password: 'password123',
                phone: '+84901000003',
                address: '268 Lý Thường Kiệt, Quận 10, TP.HCM',
                dateOfBirth: '1988-08-20',
                roleId: roles[1].id, // Technician role
                positionId: positions[2].id, // Thợ sửa nước
                isActive: true,
                hasRentedApartment: false
            },
            {
                firstName: 'Phạm',
                lastName: 'Thị Dung',
                email: 'tenant1@gmail.com',
                password: 'password123',
                phone: '+84901000004',
                address: 'Căn 0101 - Block S.01',
                dateOfBirth: '1990-12-10',
                roleId: roles[2].id, // User role (tenant)
                positionId: positions[3].id, // Tenant
                isActive: true,
                hasRentedApartment: true // Đã thuê căn hộ
            },
            {
                firstName: 'Võ',
                lastName: 'Minh Em',
                email: 'tenant2@gmail.com',
                password: 'password123',
                phone: '+84901000005',
                address: 'Căn 0102 - Block S.01',
                dateOfBirth: '1995-03-25',
                roleId: roles[2].id, // User role (tenant)
                positionId: positions[3].id, // Tenant
                isActive: true,
                hasRentedApartment: true // Đã thuê căn hộ
            },
            {
                firstName: 'Hoàng',
                lastName: 'Văn Phúc',
                email: 'user@gmail.com',
                password: 'password123',
                phone: '+84901000006',
                address: 'Chưa có địa chỉ',
                dateOfBirth: '1992-07-30',
                roleId: roles[2].id, // User role
                positionId: positions[3].id, // Tenant
                isActive: true,
                hasRentedApartment: false // Chưa thuê căn hộ
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

        // Create floors and apartments for blocks
        const apartments = [];
        
        // Block 1 (S.01): 25 apartments across 5 floors (5 apartments per floor)
        const firstBlock = blocks[0];
        const floorsBlock1 = [];
        for (let f = 1; f <= 5; f++) {
            const floor = await Floor.create({ number: f, blockId: firstBlock.id });
            floorsBlock1.push(floor);
        }
        
        for (let floorIndex = 0; floorIndex < 5; floorIndex++) {
            const floor = floorsBlock1[floorIndex];
            for (let aptNumber = 1; aptNumber <= 5; aptNumber++) {
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
                    tenantId = users.find(u => u.email === 'tenant2@gmail.com').id;
                    leaseStart = new Date('2024-06-01');
                    leaseEnd = new Date('2025-05-31');
                }
                
                const apt = await Apartment.create({ 
                    number: aptNumStr, 
                    floorId: floor.id, 
                    area: 60 + floorIndex * 2 + aptNumber * 0.5,
                    status: tenantId ? 'occupied' : 'vacant',
                    tenantId: tenantId,
                    monthlyRent: 8000000 + floorIndex * 300000 + aptNumber * 100000, // VND
                    leaseStartDate: leaseStart,
                    leaseEndDate: leaseEnd
                });
                apartments.push(apt);
            }
        }
        
        // Block 2 (S.02): 10 apartments across 2 floors (5 apartments per floor)
        const secondBlock = blocks[1];
        const floorsBlock2 = [];
        for (let f = 1; f <= 2; f++) {
            const floor = await Floor.create({ number: f, blockId: secondBlock.id });
            floorsBlock2.push(floor);
        }
        
        for (let floorIndex = 0; floorIndex < 2; floorIndex++) {
            const floor = floorsBlock2[floorIndex];
            for (let aptNumber = 1; aptNumber <= 5; aptNumber++) {
                const aptNumStr = `${(floorIndex + 1).toString().padStart(2, '0')}${aptNumber.toString().padStart(2, '0')}`;
                
                const apt = await Apartment.create({ 
                    number: aptNumStr, 
                    floorId: floor.id, 
                    area: 55 + floorIndex * 2 + aptNumber * 0.5,
                    status: 'vacant',
                    tenantId: null,
                    monthlyRent: 7500000 + floorIndex * 300000 + aptNumber * 100000, // VND
                    leaseStartDate: null,
                    leaseEndDate: null
                });
                apartments.push(apt);
            }
        }

        // Create facilities for apartment maintenance and repair
        const facilities = await Facility.bulkCreate([
            { name: 'Điện', description: 'Hệ thống điện trong căn hộ (ổ cắm, công tắc, đèn)', quantity: 1 },
            { name: 'Nước', description: 'Hệ thống nước (vòi, bồn rửa, toilet)', quantity: 1 },
            { name: 'Điều hòa', description: 'Bảo trì, sửa chữa điều hòa không khí', quantity: 1 },
            { name: 'Cửa sổ', description: 'Sửa chữa cửa sổ, khóa cửa sổ', quantity: 1 },
            { name: 'Sơn tường', description: 'Sơn lại tường căn hộ', quantity: 1 }
        ]);

        console.log('Database seeding completed successfully!');
        console.log('\nSeeded Data Summary:');
        console.log(`- ${roles.length} roles created (Admin, Technician, User)`);
        console.log(`- ${positions.length} positions created`);
        console.log(`- ${users.length} users created`);
        console.log(`- 1 building complex created`);
        console.log(`- ${blocks.length} blocks created`);
        console.log(`- Block 1 (S.01): 5 floors with 25 apartments`);
        console.log(`- Block 2 (S.02): 2 floors with 10 apartments`);
        console.log(`- Total: ${apartments.length} apartments created with tenant assignments`);
        console.log(`- ${facilities.length} facilities created for maintenance`);

        console.log('\nTest Credentials (password: password123):');
        console.log('Admin: admin@building.com');
        console.log('Thợ điện: electrician@building.com');
        console.log('Thợ nước: plumber@building.com');
        console.log('Tenant 1 (có thuê): tenant1@gmail.com');
        console.log('Tenant 2 (có thuê): tenant2@gmail.com');
        console.log('User (chưa thuê): user@gmail.com');

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