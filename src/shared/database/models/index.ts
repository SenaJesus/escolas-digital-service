import { AccessibilityModel } from './AccessibilityModel'
import { AuthorizationModel } from './AuthorizationModel'
import { ReviewModel } from './ReviewModel'
import { SchoolCensusModel } from './SchoolCensusModel'
import { CityModel } from './CityModel'
import { QuotasModel } from './QuotasModel'
import { EducationRecordModel } from './EducationRecordModel'
import { SchoolModel } from './SchoolModel'
import { StateModel } from './StateModel'
import { StaffMembersModel } from './StaffMembersModel'
import { InfrastructureModel } from './InfrastructureModel'
import { InternetAccessModel } from './InternetAccessModel'

// State <-> City
StateModel.hasMany(CityModel, { foreignKey: 'state_id', as: 'cities' })
CityModel.belongsTo(StateModel, { foreignKey: 'state_id', as: 'state' })

// City <-> School
CityModel.hasMany(SchoolModel, { foreignKey: 'city_id', as: 'schools' })
SchoolModel.belongsTo(CityModel, { foreignKey: 'city_id', as: 'city' })

// School <-> SchoolCensus
SchoolModel.hasMany(SchoolCensusModel, { foreignKey: 'school_id', as: 'censuses' })
SchoolCensusModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

// School <-> Review
SchoolModel.hasMany(ReviewModel, { foreignKey: 'school_id', as: 'reviews' })
ReviewModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

// SchoolCensus <-> Infrastructure (OneToOne)
SchoolCensusModel.hasOne(InfrastructureModel, { foreignKey: 'census_id', as: 'infrastructure' })
InfrastructureModel.belongsTo(SchoolCensusModel, { foreignKey: 'census_id', as: 'census' })

// SchoolCensus <-> EducationRecord (OneToOne)
SchoolCensusModel.hasOne(EducationRecordModel, { foreignKey: 'census_id', as: 'education_record' })
EducationRecordModel.belongsTo(SchoolCensusModel, { foreignKey: 'census_id', as: 'census' })

// Infrastructure <-> Accessibility (OneToOne)
InfrastructureModel.belongsTo(AccessibilityModel, {
  foreignKey: 'accessibility_id',
  as: 'accessibility',
})
AccessibilityModel.hasOne(InfrastructureModel, {
  foreignKey: 'accessibility_id',
  as: 'infrastructure',
})

// Infrastructure <-> InternetAccess (OneToOne)
InfrastructureModel.belongsTo(InternetAccessModel, {
  foreignKey: 'internet_access_id',
  as: 'internet_access',
})
InternetAccessModel.hasOne(InfrastructureModel, {
  foreignKey: 'internet_access_id',
  as: 'infrastructure',
})

// Infrastructure <-> StaffMembers (OneToOne)
InfrastructureModel.belongsTo(StaffMembersModel, {
  foreignKey: 'staff_members_id',
  as: 'staff_members',
})
StaffMembersModel.hasOne(InfrastructureModel, {
  foreignKey: 'staff_members_id',
  as: 'infrastructure',
})

// EducationRecord <-> Quotas (OneToOne)
EducationRecordModel.belongsTo(QuotasModel, { foreignKey: 'quotas_id', as: 'quotas' })
QuotasModel.hasOne(EducationRecordModel, { foreignKey: 'quotas_id', as: 'education_record' })

export {
  AccessibilityModel,
  AuthorizationModel,
  ReviewModel,
  SchoolCensusModel,
  CityModel,
  QuotasModel,
  EducationRecordModel,
  SchoolModel,
  StateModel,
  StaffMembersModel,
  InfrastructureModel,
  InternetAccessModel,
}
