from flask_restful import Api
from controller.user_controller import UserRegistration, UserLogin, UserProfile, ResumeUpload
from controller.job_controller import PostJob, GetAllJobs, GetJobById
# from controller.analyze_resume import JobDetails


def initialize_routes(api: Api):
    api.add_resource(UserRegistration, '/register')
    api.add_resource(UserLogin, '/login')
    api.add_resource(UserProfile, '/profile')
    api.add_resource(ResumeUpload, '/resume/upload')
    api.add_resource(PostJob, '/recruiter/postjob')
    api.add_resource(GetAllJobs, '/recruiter/getAlljobs')
    api.add_resource(GetJobById, '/recruiter/job/')
    # api.add_resource(JobDetails, '/get/job/')

