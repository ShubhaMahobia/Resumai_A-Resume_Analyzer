from flask_restful import Api
from controller.user_controller import UserRegistration, UserLogin, UserProfile, ResumeUploadResource, FetchAppliedJobs
from controller.job_controller import PostJob, GetAllJobs, GetJobById, GetMyJobs, GetJobCandidates
# from controller.analyze_resume import JobDetails


def initialize_routes(api: Api):
    api.add_resource(UserRegistration, '/register')
    api.add_resource(UserLogin, '/login')
    api.add_resource(UserProfile, '/profile')
    api.add_resource(ResumeUploadResource, '/resume/upload')
    api.add_resource(PostJob, '/recruiter/postjob')
    api.add_resource(GetAllJobs, '/getAlljobs')
    api.add_resource(GetJobById, '/recruiter/job/<string:job_id>')
    api.add_resource(GetMyJobs, '/get/my/job')
    api.add_resource(FetchAppliedJobs, '/get/applied/job')
    api.add_resource(GetJobCandidates, '/recruiter/job/<string:job_id>/candidates')

