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
import { EnemResultModel } from './EnemResultModel'
import { EnemAggregateModel } from './EnemAggregateModel'
import { IdebScoreModel } from './IdebScoreModel'
import { PddeTransferModel } from './PddeTransferModel'
import { PddeProgramModel } from './PddeProgramModel'
import { SubscriptionModel } from './SubscriptionModel'
import { UserModel } from './UserModel'
import { UserChildSchoolModel } from './UserChildSchoolModel'
import { UserPhotoSchoolModel } from './UserPhotoSchoolModel'
import { SchoolImageModel } from './SchoolImageModel'

StateModel.hasMany(CityModel, { foreignKey: 'state_id', as: 'cities' })
CityModel.belongsTo(StateModel, { foreignKey: 'state_id', as: 'state' })

CityModel.hasMany(SchoolModel, { foreignKey: 'city_id', as: 'schools' })
SchoolModel.belongsTo(CityModel, { foreignKey: 'city_id', as: 'city' })

SchoolModel.hasMany(SchoolCensusModel, { foreignKey: 'school_id', as: 'censuses' })
SchoolCensusModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

SchoolModel.hasMany(ReviewModel, { foreignKey: 'school_id', as: 'reviews' })
ReviewModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

SchoolCensusModel.hasOne(InfrastructureModel, { foreignKey: 'census_id', as: 'infrastructure' })
InfrastructureModel.belongsTo(SchoolCensusModel, { foreignKey: 'census_id', as: 'census' })

SchoolCensusModel.hasOne(EducationRecordModel, { foreignKey: 'census_id', as: 'education_record' })
EducationRecordModel.belongsTo(SchoolCensusModel, { foreignKey: 'census_id', as: 'census' })

InfrastructureModel.belongsTo(AccessibilityModel, {
  foreignKey: 'accessibility_id',
  as: 'accessibility',
})
AccessibilityModel.hasOne(InfrastructureModel, {
  foreignKey: 'accessibility_id',
  as: 'infrastructure',
})

InfrastructureModel.belongsTo(InternetAccessModel, {
  foreignKey: 'internet_access_id',
  as: 'internet_access',
})
InternetAccessModel.hasOne(InfrastructureModel, {
  foreignKey: 'internet_access_id',
  as: 'infrastructure',
})

InfrastructureModel.belongsTo(StaffMembersModel, {
  foreignKey: 'staff_members_id',
  as: 'staff_members',
})
StaffMembersModel.hasOne(InfrastructureModel, {
  foreignKey: 'staff_members_id',
  as: 'infrastructure',
})

EducationRecordModel.belongsTo(QuotasModel, { foreignKey: 'quotas_id', as: 'quotas' })
QuotasModel.hasOne(EducationRecordModel, { foreignKey: 'quotas_id', as: 'education_record' })

SchoolModel.hasMany(EnemResultModel, { foreignKey: 'school_id', as: 'enem_results' })
EnemResultModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

SchoolModel.hasMany(IdebScoreModel, { foreignKey: 'school_id', as: 'ideb_scores' })
IdebScoreModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

SchoolModel.hasMany(PddeTransferModel, { foreignKey: 'school_id', as: 'pdde_transfers' })
PddeTransferModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

SchoolModel.hasMany(PddeProgramModel, { foreignKey: 'school_id', as: 'pdde_programs' })
PddeProgramModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

EnemAggregateModel.belongsTo(CityModel, { foreignKey: 'city_id', as: 'city' })
EnemAggregateModel.belongsTo(StateModel, { foreignKey: 'state_id', as: 'state' })

SchoolModel.hasMany(SubscriptionModel, { foreignKey: 'school_id', as: 'subscriptions' })
SubscriptionModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

UserModel.hasMany(UserChildSchoolModel, { foreignKey: 'user_id', as: 'child_schools' })
UserChildSchoolModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' })
UserChildSchoolModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

UserModel.hasMany(UserPhotoSchoolModel, { foreignKey: 'user_id', as: 'photo_schools' })
UserPhotoSchoolModel.belongsTo(UserModel, { foreignKey: 'user_id', as: 'user' })
UserPhotoSchoolModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

SchoolModel.hasOne(SchoolImageModel, { foreignKey: 'school_id', as: 'image' })
SchoolImageModel.belongsTo(SchoolModel, { foreignKey: 'school_id', as: 'school' })

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
  EnemResultModel,
  EnemAggregateModel,
  IdebScoreModel,
  PddeTransferModel,
  PddeProgramModel,
  SubscriptionModel,
  UserModel,
  UserChildSchoolModel,
  UserPhotoSchoolModel,
  SchoolImageModel,
}
