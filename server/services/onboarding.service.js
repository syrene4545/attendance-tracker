// import { pool } from '../index.js';
// import { seedCompanySOPs } from './seedSops.service.js';

// /**
//  * Complete onboarding process for new company
//  * Automatically seeds SOPs and sets up initial data
//  */
// export async function onboardNewCompany({ companyId, adminId, seedSOPs = true }) {
//   console.log('🎉 Starting company onboarding', {
//     companyId,
//     adminId,
//     seedSOPs,
//     timestamp: new Date().toISOString()
//   });

//   const results = {
//     companyId,
//     sopsSeeded: false,
//     sopResult: null,
//     errors: []
//   };

//   try {
//     // ✅ AUTO-SEED SOPs if enabled
//     if (seedSOPs) {
//       console.log('📚 Auto-seeding SOPs for new company');
      
//       try {
//         const sopResult = await seedCompanySOPs({
//           companyId,
//           adminId,
//           dryRun: false
//         });
        
//         results.sopsSeeded = true;
//         results.sopResult = sopResult;
        
//         console.log('✅ SOPs seeded successfully during onboarding', sopResult);
//       } catch (sopError) {
//         console.error('❌ SOP seeding failed during onboarding:', sopError);
//         results.errors.push({
//           step: 'sop_seeding',
//           error: sopError.message
//         });
//       }
//     }

//     // ✅ Additional onboarding steps can be added here:
//     // - Initialize leave balances
//     // - Create default departments
//     // - Set up notification preferences
//     // - etc.

//     console.log('✅ Company onboarding completed', {
//       companyId,
//       sopsSeeded: results.sopsSeeded,
//       errors: results.errors.length,
//       timestamp: new Date().toISOString()
//     });

//     return results;

//   } catch (error) {
//     console.error('❌ Company onboarding failed', {
//       companyId,
//       error: error.message,
//       timestamp: new Date().toISOString()
//     });
//     throw error;
//   }
// }

import { pool } from '../index.js';
import { seedCompanySOPs } from './seedSops.service.js';
import { seedCompanyAssessments } from './seedAssessments.service.js';

export async function onboardNewCompany({ 
  companyId, 
  adminId, 
  seedSOPs = true,
  seedAssessments = true // ✅ NEW parameter
}) {
  console.log('🎉 Starting company onboarding', {
    companyId,
    adminId,
    seedSOPs,
    seedAssessments,
    timestamp: new Date().toISOString()
  });

  const results = {
    companyId,
    sopsSeeded: false,
    sopResult: null,
    assessmentsSeeded: false, // ✅ NEW
    assessmentResult: null,   // ✅ NEW
    errors: []
  };

  try {
    // ✅ AUTO-SEED SOPs
    if (seedSOPs) {
      console.log('📚 Auto-seeding SOPs for new company');
      
      try {
        const sopResult = await seedCompanySOPs({
          companyId,
          adminId,
          dryRun: false
        });
        
        results.sopsSeeded = true;
        results.sopResult = sopResult;
        
        console.log('✅ SOPs seeded successfully during onboarding', sopResult);
      } catch (sopError) {
        console.error('❌ SOP seeding failed during onboarding:', sopError);
        results.errors.push({
          step: 'sop_seeding',
          error: sopError.message
        });
      }
    }

    // ✅ AUTO-SEED ASSESSMENTS
    if (seedAssessments) {
      console.log('📝 Auto-seeding assessments for new company');
      
      try {
        const assessmentResult = await seedCompanyAssessments({
          companyId,
          adminId,
          dryRun: false
        });
        
        results.assessmentsSeeded = true;
        results.assessmentResult = assessmentResult;
        
        console.log('✅ Assessments seeded successfully during onboarding', assessmentResult);
      } catch (assessmentError) {
        console.error('❌ Assessment seeding failed during onboarding:', assessmentError);
        results.errors.push({
          step: 'assessment_seeding',
          error: assessmentError.message
        });
      }
    }

    console.log('✅ Company onboarding completed', {
      companyId,
      sopsSeeded: results.sopsSeeded,
      assessmentsSeeded: results.assessmentsSeeded,
      errors: results.errors.length,
      timestamp: new Date().toISOString()
    });

    return results;

  } catch (error) {
    console.error('❌ Company onboarding failed', {
      companyId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}