import Course from "../models/course.model.js";
import AppError from "../utils/error.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";

const getAllCourses = async function(req, res, next) {
  try {
   const courses = await Course.find({}).select("-lectures");

   res.status(200).json({
       success: true,
       message:"All courses",
       courses,
   });
  } catch (e) {
   return next(
       new AppError(e.message, 500)
       )
  }
   
}

const getLecturesByCourseId = async function(req, res, next) {
   try {
       const { id } = req.params;
       const course = await Course.findById(id);

       if(!course){ 
           return next(
               new AppError("Inavlid course id", 400)
               )
       }

       res.status(200).json({
           success: true,
           message:"Course lectures fetched successfully",
           lectures: course.lectures
       })

   } catch (e) {
       return next(
           new AppError(e.message, 500)
           )
   }

}


const createCourse = async (req, res, next)=>{
   try {
   const { title, description, category, createdBy } = req.body;

   if ( !title || !description || !category || !createdBy) {
           return next(
               new AppError("Inavlid course id", 400)
           )      
   }

   const course = await Course.create({
       title,
       description,
       category,
       createdBy,
       thumbnail: {
           public_id: "Dummy",
           secure_url: "Dummy"
       }
   });

   if(!course){
       return next(
           new AppError("Course could not created, please try again", 400)
       ) 
   }

   if (req.file) {
       try {
           const result = await cloudinary.v2.uploader.upload(req.file.path,{
               folder: "lms"
           });
           if (result) {
               course.thumbnail.public_id = result.public_id;
               course.thumbnail.secure_url = result.secure_url;
           }
           fs.rm(`uploads/${req.file.filename}`); 
       }
        catch (e) {
            console.log("file upload failed"+e)
            return next(e || new AppError('File upload failed',500)); 
       }
   }   

   await course.save();

   res.status(200).json({
       success: true,
       message: "Course created successfully",
       course
   });
   } catch (e) {
       return next(
           new AppError(e.message, 500)
           )
   }
   
}


const updateCourse = async (req, res, next)=>{
   try {
       const { id } = req.params;
       console.log("body"+req.body);
       const course = await Course.findByIdAndUpdate(
           id,
           {
               $set: req.body
           },
           {
               runValidators: true
           }
       );

       if (!course) {
           return next(
               new AppError("Course with given id does not exist!", 400)
               )
       }
       
       res.status(200).json({
           success: true,
           message: "Course updated successfully!",
           course
       })


   } catch (e) {
       return next(
           new AppError(e.message, 500)
           )
   }
}

const removeCourse = async (req, res, next)=>{
   try {
       const { id } = req.params;
       const course = await Course.findById(id);

       if (!course) {
           return next(
               new AppError("Course with given id does not exist!", 400)
               )
       }

       await course.deleteOne();
       res.status(200).json({
           success: true,
           message: "Course deleted successfully"
       })

   } catch (e) {
       return next(
           new AppError(e.message, 500)
           )
   }
}



const addLectureToCourseById = async (req, res, next)=>{
   try {
       const{ title, description } = req.body;
       const{ id } = req.params;

       if ( !title || !description ) {
           return next(
               new AppError("Title and description required", 400)
           )      
       }
   
       const course = await Course.findById(id);
   
       if (!course) {
           return next(
               new AppError("Course with given id does not exist!", 400)
           )
       }
   
       const lectureData = {
           title,
           description,
           lecture:{}
       };
   
       if (req.file) {
           try {
               console.log("inside if ")
               const result = await cloudinary.v2.uploader.upload(req.file.path,{
                   folder: "lms",
                   resource_type:'video',
               });
               if (result) {
                   lectureData.lecture.public_id = result.public_id;
                   lectureData.lecture.secure_url = result.secure_url;
               }
               fs.rm(`uploads/${req.file.filename}`); 
           }
            catch (e) {
                console.log("file upload failed mahn"+e)
                return next(e || new AppError('File upload failed',500)); 

           }
       } 
   
       course.lectures.push(lectureData);
   
       course.numberOfLectures = course.lectures.length;
   
       await course.save();
   
       res.status(200).json({
           success: true,
           message: "Lecture successfully added tp the course",
           course
       })
   
   } catch (e) {
       return next(
           new AppError(e.message, 500)
       )
   }
}

const removeLecture = async (req, res, next)=> { 
    
       const { courseId, lectureId } = req.query;

     
       if (!courseId) {
         return next(new AppError('Course ID is required', 400));
       }
     
       if (!lectureId) {
         return next(new AppError('Lecture ID is required', 400));
       }
     
       const course = await Course.findById(courseId);
     
       if (!course) {
         return next(new AppError('Invalid ID or Course does not exist.', 404));
       }
     
       const lectureIndex = course.lectures.findIndex(
         (lecture) => lecture._id.toString() === lectureId.toString()
       );
     
       if (lectureIndex === -1) {
         return next(new AppError('Lecture does not exist.', 404));
       }
     
       await cloudinary.v2.uploader.destroy(
         course.lectures[lectureIndex].lecture.public_id,
         {
           resource_type: 'video',
         }
       );
     
       course.lectures.splice(lectureIndex, 1);
     
       course.numberOfLectures = course.lectures.length;
     
       await course.save();
     
       res.status(200).json({
         success: true,
         message: 'Course lecture removed successfully',
       })
     }



export{
   getAllCourses,
   getLecturesByCourseId,
   createCourse,
   updateCourse,
   removeCourse,
   addLectureToCourseById,
   removeLecture,
}