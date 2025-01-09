-- CreateTable
CREATE TABLE "User" (
    "uId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uId")
);

-- CreateTable
CREATE TABLE "CodeTemplate" (
    "templateId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "codeId" INTEGER,
    "language" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forkedFromId" INTEGER,

    CONSTRAINT "CodeTemplate_pkey" PRIMARY KEY ("templateId")
);

-- CreateTable
CREATE TABLE "CodeTemplateTag" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "CodeTemplateTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "postId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "netvote" INTEGER NOT NULL DEFAULT 0,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("postId")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "id" SERIAL NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "commentId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "parentId" INTEGER,
    "blogPostId" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentId")
);

-- CreateTable
CREATE TABLE "Report" (
    "reportId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "blogPostId" INTEGER,
    "commentId" INTEGER,
    "codeTemplateId" INTEGER,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("reportId")
);

-- CreateTable
CREATE TABLE "Code" (
    "codeId" SERIAL NOT NULL,
    "body" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "stdin" TEXT,
    "path" TEXT,
    "stdout" TEXT,
    "stderr" TEXT,
    "codeTemplateId" INTEGER,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("codeId")
);

-- CreateTable
CREATE TABLE "_CodeTemplateTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BlogPostUpvotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BlogPostDownvotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BlogPostTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_BlogPostCodeTemplates" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CommentUpvotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_CommentDownvotes" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "CodeTemplate_codeId_key" ON "CodeTemplate"("codeId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeTemplateTag_tag_key" ON "CodeTemplateTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostTag_tag_key" ON "BlogPostTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "Code_codeTemplateId_key" ON "Code"("codeTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "_CodeTemplateTags_AB_unique" ON "_CodeTemplateTags"("A", "B");

-- CreateIndex
CREATE INDEX "_CodeTemplateTags_B_index" ON "_CodeTemplateTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostUpvotes_AB_unique" ON "_BlogPostUpvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostUpvotes_B_index" ON "_BlogPostUpvotes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostDownvotes_AB_unique" ON "_BlogPostDownvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostDownvotes_B_index" ON "_BlogPostDownvotes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostTags_AB_unique" ON "_BlogPostTags"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostTags_B_index" ON "_BlogPostTags"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BlogPostCodeTemplates_AB_unique" ON "_BlogPostCodeTemplates"("A", "B");

-- CreateIndex
CREATE INDEX "_BlogPostCodeTemplates_B_index" ON "_BlogPostCodeTemplates"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CommentUpvotes_AB_unique" ON "_CommentUpvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_CommentUpvotes_B_index" ON "_CommentUpvotes"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CommentDownvotes_AB_unique" ON "_CommentDownvotes"("A", "B");

-- CreateIndex
CREATE INDEX "_CommentDownvotes_B_index" ON "_CommentDownvotes"("B");

-- AddForeignKey
ALTER TABLE "CodeTemplate" ADD CONSTRAINT "CodeTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeTemplate" ADD CONSTRAINT "CodeTemplate_forkedFromId_fkey" FOREIGN KEY ("forkedFromId") REFERENCES "CodeTemplate"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("postId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("postId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("commentId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_codeTemplateId_fkey" FOREIGN KEY ("codeTemplateId") REFERENCES "CodeTemplate"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_codeTemplateId_fkey" FOREIGN KEY ("codeTemplateId") REFERENCES "CodeTemplate"("templateId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CodeTemplateTags" ADD CONSTRAINT "_CodeTemplateTags_A_fkey" FOREIGN KEY ("A") REFERENCES "CodeTemplate"("templateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CodeTemplateTags" ADD CONSTRAINT "_CodeTemplateTags_B_fkey" FOREIGN KEY ("B") REFERENCES "CodeTemplateTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostUpvotes" ADD CONSTRAINT "_BlogPostUpvotes_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostUpvotes" ADD CONSTRAINT "_BlogPostUpvotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostDownvotes" ADD CONSTRAINT "_BlogPostDownvotes_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostDownvotes" ADD CONSTRAINT "_BlogPostDownvotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostTags" ADD CONSTRAINT "_BlogPostTags_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostTags" ADD CONSTRAINT "_BlogPostTags_B_fkey" FOREIGN KEY ("B") REFERENCES "BlogPostTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostCodeTemplates" ADD CONSTRAINT "_BlogPostCodeTemplates_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlogPostCodeTemplates" ADD CONSTRAINT "_BlogPostCodeTemplates_B_fkey" FOREIGN KEY ("B") REFERENCES "CodeTemplate"("templateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentUpvotes" ADD CONSTRAINT "_CommentUpvotes_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("commentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentUpvotes" ADD CONSTRAINT "_CommentUpvotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentDownvotes" ADD CONSTRAINT "_CommentDownvotes_A_fkey" FOREIGN KEY ("A") REFERENCES "Comment"("commentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommentDownvotes" ADD CONSTRAINT "_CommentDownvotes_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("uId") ON DELETE CASCADE ON UPDATE CASCADE;
